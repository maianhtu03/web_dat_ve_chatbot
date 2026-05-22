const momoService = require("../services/momoService");
const db = require('../config/db');
const { sendTicketEmail } = require('../utils/emailService');
const Ticket = require('../models/ticketModel');
const MemberService = require('../services/MemberService');

const createMomoUrl = async (req, res) => {
    try {
        const { amount, bookingId, userId } = req.body;

        // Cập nhật phương thức thanh toán là MOMO ngay khi người dùng chọn
        await db.query("UPDATE bookings SET payment_method = 'MOMO' WHERE id = ?", [bookingId]);

        const result = await momoService.generateMomoUrl(amount, bookingId, null, userId);
        res.status(200).json({ paymentUrl: result.payUrl });
    } catch (error) {
        res.status(500).json({ message: "Lỗi tạo thanh toán MoMo" });
    }
};

const handleMomoIPN = async (req, res) => {
    try {
        const { resultCode, amount, extraData, transId } = req.body;

        if (resultCode === 0) {
            const decoded = JSON.parse(Buffer.from(extraData, 'base64').toString());
            const { bookingId, userId } = decoded;

            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0'); // Tháng trong JS chạy từ 0 - 11
            const paddedId = String(bookingId).padStart(4, '0'); // Biến 225 thành '0225'
            const ticketCode = `${day}${month}${paddedId}`;
            // 1. CẬP NHẬT TRẠNG THÁI BOOKING & GHẾ (Giống VNPAY)
            await db.query("UPDATE bookings SET payment_status = 'paid', trans_id = ?, ticket_code = ? WHERE id = ?", [transId, ticketCode, bookingId]);
            await db.query("UPDATE showtime_seats SET status = 'booked', hold_expires_at = NULL WHERE booking_id = ?", [bookingId]);

            // 2. LOGIC TÍCH ĐIỂM & TRỪ ĐIỂM (Giống VNPAY)
            const [rows] = await db.query("SELECT user_id, total_price, points_used FROM bookings WHERE id = ?", [bookingId]);
            if (rows.length > 0) {
                const { user_id, total_price, points_used } = rows[0];
                if (points_used > 0) {
                    await db.query("UPDATE memberships SET current_points = current_points - ?, used_points = used_points + ? WHERE user_id = ?", [points_used, points_used, user_id]);
                }
                await MemberService.handleNewTransaction(user_id, total_price);
            }

            // 3. GỬI EMAIL VÉ & QR CODE (Giống VNPAY)
            const info = await Ticket.findById(bookingId);
            if (info) {
                const combos = await Ticket.findCombosByTicketId(bookingId);
                sendTicketEmail(info.user_email, {
                    id: ticketCode,
                    movie_title: info.title,
                    cinema_name: info.cinema_name,
                    room_name: info.room_name,
                    seat_labels: info.seat_names,
                    start_time: info.start_time,
                    show_date: info.show_date,
                    total_price: info.total_price
                }, combos).catch(e => console.error("Lỗi gửi mail MoMo:", e));
            }

            return res.status(204).send(); // MoMo cần mã 204 hoặc 200 tùy version
        }
        res.status(200).send();
    } catch (error) {
        console.error("Lỗi xử lý IPN MoMo:", error);
        res.status(500).send();
    }
};

module.exports = { createMomoUrl, handleMomoIPN };