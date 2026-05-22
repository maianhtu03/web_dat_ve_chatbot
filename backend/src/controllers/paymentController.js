const vnpayService = require("../services/vnpayService");
const db = require('../config/db');
const { sendTicketEmail } = require('../utils/emailService');
const Ticket = require('../models/ticketModel'); // IMPORT MODEL TICKET
const MemberService = require('../services/MemberService');
const VoucherService = require('../services/VoucherService');
const createVnpayUrl = (req, res) => {
    const { amount, bookingId } = req.body;
    // Lấy IP chuẩn hơn
    const ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        '127.0.0.1';

    const paymentUrl = vnpayService.generatePaymentUrl(ipAddr, amount, bookingId);
    res.status(200).json({ paymentUrl });
};

const vnpayReturn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        let responseCode = vnp_Params['vnp_ResponseCode'];
        let bookingId = vnp_Params['vnp_TxnRef'];

        // Kiểm tra xem bookingId có tồn tại không để tránh lỗi SQL
        if (!bookingId) {
            return res.redirect(`http://localhost:5173/payment-fail?message=MissingBookingId`);
        }

        let ticketCodeToShow = bookingId;
        if (responseCode === '00') {
            // THÀNH CÔNG: Cập nhật DB
            await db.query("UPDATE bookings SET payment_status = 'paid' WHERE id = ?", [bookingId]);
            await db.query("UPDATE showtime_seats SET status = 'booked', hold_expires_at = NULL WHERE booking_id = ?", [bookingId]);


            try {
                // Lấy userId và số tiền từ booking vừa thanh toán
                const [rows] = await db.query("SELECT user_id, total_price, points_used, voucher_id, ticket_code FROM bookings WHERE id = ?", [bookingId]);
                if (rows.length > 0) {
                    const { user_id, total_price, points_used, voucher_id, ticket_code } = rows[0];

                    if (ticket_code) {
                        ticketCodeToShow = ticket_code;
                    }

                    // --- LOGIC MỚI: CẬP NHẬT VOUCHER ---
                    // Đoạn này trong code của bạn đã đúng logic:
                    if (voucher_id) {
                        console.log(`>>> Đang xử lý Voucher ID: ${voucher_id}`);
                        // Gọi Service (đã sửa dùng execute)
                        await VoucherService.updateUsageCount(voucher_id);

                        // Cập nhật trạng thái trong ví cá nhân
                        await db.query(
                            "UPDATE user_vouchers SET status = 'used' WHERE user_id = ? AND voucher_id = ?",
                            [user_id, voucher_id]
                        );
                    }

                    // --- LOGIC MỚI: Trừ điểm đã áp dụng (Không làm hỏng logic cũ) ---
                    if (points_used && points_used > 0) {
                        await db.query(
                            `UPDATE memberships 
                             SET current_points = current_points - ?, 
                                 used_points = used_points + ? 
                             WHERE user_id = ?`,
                            [points_used, points_used, user_id]
                        );
                        console.log(`>>> Đã trừ ${points_used} điểm thành công.`);
                    }
                    // Gọi service để cộng tiền và điểm (Hàm này bạn đã viết trong MemberService)
                    await MemberService.handleNewTransaction(user_id, total_price, bookingId);
                    console.log(`>>> Đã cập nhật chi tiêu cho User: ${user_id}`);
                }
            } catch (memberError) {
                // Dùng try-catch riêng để nếu lỗi tích điểm thì khách vẫn nhận được vé/mail
                console.error("Lỗi tích điểm thành viên (không ảnh hưởng thanh toán):", memberError);
            }
            try {
                // SỬ DỤNG HÀM TICKET.FINDBYID ĐỂ LẤY DỮ LIỆU GHẾ CHUẨN (J7-J8, F8...)
                // Hàm này đã được tối ưu logic ở các bước trước
                const info = await Ticket.findById(bookingId);

                if (info) {
                    // Gọi hàm gửi mail (giữ nguyên kiểu gọi không await để redirect nhanh)
                    const combos = await Ticket.findCombosByTicketId(bookingId);
                    sendTicketEmail(info.user_email, {
                        id: ticketCodeToShow,
                        movie_title: info.title,
                        cinema_name: info.cinema_name,
                        room_name: info.room_name || 'Phòng chiếu',
                        seat_labels: info.seat_names, // Đã có logic J7-J8 từ Ticket.js
                        start_time: info.start_time,
                        show_date: info.show_date,
                        total_price: info.total_price
                    },
                        combos
                    ).catch(e => console.error("Lỗi gửi mail ngầm:", e));
                }
            } catch (mailError) {
                console.error("Lỗi lấy thông tin gửi mail:", mailError);
            }

            // Redirect về cổng 5173 (Vite FE của bạn)
            res.redirect(`http://localhost:5173/payment-success?ticketCode=${ticketCodeToShow}&id=${bookingId}`);
        } else {
            // THẤT BẠI: Cập nhật trạng thái failed
            await db.query("UPDATE bookings SET payment_status = 'failed' WHERE id = ?", [bookingId]);

            const [failRows] = await db.query("SELECT ticket_code FROM bookings WHERE id = ?", [bookingId]);
            if (failRows.length > 0 && failRows[0].ticket_code) {
                ticketCodeToShow = failRows[0].ticket_code;
            }

            res.redirect(`http://localhost:5173/payment-fail?ticketCode=${ticketCodeToShow}&id=${bookingId}`);
        }
    } catch (error) {
        console.error("Lỗi xử lý VNPAY Return:", error);
        res.status(500).send("Đã có lỗi xảy ra trong quá trình xử lý thanh toán.");
    }
};

module.exports = { createVnpayUrl, vnpayReturn };