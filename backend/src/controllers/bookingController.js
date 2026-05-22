const db = require('../config/db');

const createBooking = async (req, res) => {
    const { userId, showtimeId, totalPrice, seatIds, combos, pointsUsed, pointsEarned, paymentMethod, voucherId } = req.body;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [existingSeats] = await connection.query(
            `SELECT seat_id FROM showtime_seats 
             WHERE showtime_id = ? AND seat_id IN (?) 
             AND (status = 'booked' OR (status = 'reserved' AND hold_expires_at > NOW()))`,
            [showtimeId, seatIds]
        );

        if (existingSeats.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "Một hoặc nhiều ghế bạn chọn vừa có người giữ hoặc đã được mua."
            });
        }

        // 1. Tạo bản ghi Booking mới (Giữ nguyên logic cũ)
        const [result] = await connection.query(
            "INSERT INTO bookings (user_id, showtime_id, total_price,points_used,points_earned, payment_status,payment_method, voucher_id) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)",
            [userId, showtimeId, totalPrice, pointsUsed || 0, pointsEarned || 0, paymentMethod || 'VNPAY', voucherId || null]
        );
        const bookingId = result.insertId;

        const now = new Date();
        const day = now.getDate().toString().padStart(2, '0');         // Ví dụ ngày: "18"
        const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Ví dụ tháng: "05"

        // Ép ID tự tăng về chuỗi 4 chữ số (Ví dụ: ID 14 -> "0014")
        const formattedId = bookingId.toString().padStart(4, '0');

        // Ghép thành chuỗi mã hóa đơn đúng 8 ký tự số: 18050014
        const generatedTicketCode = `${day}${month}${formattedId}`;

        // Lưu trực tiếp vào cột ticket_code vừa tạo trong Database bằng kết nối transaction hiện tại
        await connection.query(
            "UPDATE bookings SET ticket_code = ? WHERE id = ?",
            [generatedTicketCode, bookingId]
        );

        if (combos && combos.length > 0) {
            // Chuyển đổi mảng combos thành mảng các mảng giá trị để Bulk Insert
            const comboValues = combos.map(item => [
                item.id,       // combo_id
                item.quantity, // quantity
                bookingId      // liên kết với booking vừa tạo
            ]);

            const comboInsertQuery = "INSERT INTO combo_items (combo_id, quantity, booking_id) VALUES ?";
            await connection.query(comboInsertQuery, [comboValues]);
        }

        const holdTime = new Date(Date.now() + 10 * 60 * 1000);
        // 2. Chuyển trạng thái ghế sang 'reserved' (Dùng INSERT ... ON DUPLICATE KEY UPDATE)
        // Chuẩn bị mảng dữ liệu cho phương thức chèn hàng loạt (Bulk Insert)
        // Cấu trúc: [[showtime_id, seat_id, booking_id, status], [...]]
        const seatValues = seatIds.map(seatId => [
            showtimeId,
            seatId,
            bookingId,
            'reserved', // Dùng số 2 cho 'processing/giữ ghế'
            holdTime
        ]);

        // Cập nhật câu lệnh: Nếu trùng (showtime_id, seat_id) thì chỉ update status và booking_id
        const upsertQuery = `
            INSERT INTO showtime_seats (showtime_id, seat_id, booking_id, status,hold_expires_at) 
            VALUES ? 
            ON DUPLICATE KEY UPDATE 
                booking_id = VALUES(booking_id), 
                status = VALUES(status),
                hold_expires_at = VALUES(hold_expires_at)
        `;

        await connection.query(upsertQuery, [seatValues]);

        await connection.commit();
        res.status(200).json({ success: true, bookingId, ticketCode: generatedTicketCode });
    } catch (error) {
        await connection.rollback();
        console.error("Lỗi Booking:", error);
        res.status(500).json({ message: "Lỗi tạo đặt vé", error: error.message });
    } finally {
        connection.release();
    }
};
// --- HÀM LẤY LỊCH SỬ ĐẶT VÉ THEO USER ID (THÊM MỚI) ---
const getUserBookings = async (req, res) => {
    try {
        const { userId } = req.params;

        // Câu truy vấn này lấy thông tin booking và gộp luôn danh sách ghế thành chuỗi (G1, G2)
        // Lưu ý: Tên bảng và cột phải khớp với DB của bạn (ví dụ: seats hay showtime_seats)
        const query = `
            SELECT 
                b.id, 
                b.ticket_code,
                b.showtime_id, 
                b.total_price, 
                b.points_earned,
                b.payment_status, 
                b.payment_method,
                b.created_at,
                GROUP_CONCAT(s.seat_number SEPARATOR ', ') AS seat_list
            FROM bookings b
            LEFT JOIN showtime_seats ss ON b.id = ss.booking_id
            LEFT JOIN seats s ON ss.seat_id = s.id
            WHERE b.user_id = ?
            GROUP BY b.id
            ORDER BY b.created_at DESC
        `;

        const [bookings] = await db.query(query, [userId]);

        res.status(200).json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error("Lỗi lấy lịch sử đặt vé:", error);
        res.status(500).json({ success: false, message: "Lỗi Server", error: error.message });
    }
};

// --- HÀM LẤY CHI TIẾT 1 BOOKING (THÊM MỚI - NẾU CẦN) ---
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const [booking] = await db.query("SELECT * FROM bookings WHERE id = ?", [id]);

        if (booking.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }
        res.status(200).json(booking[0]);
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
};

module.exports = { createBooking, getUserBookings, getBookingById };