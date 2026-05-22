const db = require('../config/db');

const Ticket = {
    // 1. Lấy danh sách toàn bộ vé (Dùng cho trang quản lý Admin)
    findAll: async (filters = {}) => {
        let whereClauses = [];
        let params = [];

        // 1. Lọc theo Chi nhánh
        if (filters.branch) {
            whereClauses.push(`c.branch_id = ?`);
            params.push(Number(filters.branch));
        }

        // 2. Lọc theo Rạp
        if (filters.cinema) {
            whereClauses.push(`c.id = ?`);
            params.push(Number(filters.cinema));
        }

        // 3. Lọc theo Ngày
        if (filters.date) {
            whereClauses.push(`DATE(st.show_date) = ?`);
            params.push(filters.date);
        }

        // 4. Lọc theo Trạng thái
        if (filters.status && filters.status !== 'all') {
            whereClauses.push(`b.payment_status = ?`);
            params.push(filters.status);
        }

        // 5. Lọc theo Phim
        if (filters.movie) {
            whereClauses.push(`m.id = ?`);
            params.push(Number(filters.movie));
        }

        // 6. Tìm kiếm (CHỈ đưa điều kiện băm mã vé vào đây để không lỗi khi load mặc định)
        if (filters.search) {
            whereClauses.push(`(b.id LIKE ? OR u.fullName LIKE ? OR b.ticket_code LIKE ?)`);
            params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
        }

        const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const query = `
    SELECT 
        -- Sử dụng COALESCE để đảm bảo các vé cũ không có created_at vẫn tự động đổi sang mã dài
       COALESCE(b.ticket_code, CAST(b.id AS CHAR)) as ticket_id,
        b.id as real_booking_id,
        b.total_price, 
        b.payment_status, 
        b.payment_method, 
        b.created_at,
        b.is_printed,
        b.printed_at,
        u.fullName as user_name, 
        u.email as user_email,
        u.role as user_role,
        m.title as movie_title, 
        m.poster as poster_url, 
        c.name as cinema_name,
        c.address as cinema_address,
        st.start_time, 
        st.show_date,
        (SELECT GROUP_CONCAT(
            CASE 
                WHEN s_ordered.type = 'couple' THEN CONCAT(s_ordered.row_label, s_ordered.real_number, '-', s_ordered.row_label, s_ordered.real_number + 1)
                ELSE CONCAT(s_ordered.row_label, s_ordered.real_number)
            END 
            ORDER BY s_ordered.row_label, s_ordered.real_number SEPARATOR ', '
         )
         FROM (
            SELECT 
                id, row_label, type, template_id, col_index,
                ROW_NUMBER() OVER (PARTITION BY template_id, row_label ORDER BY col_index ASC) as real_number
            FROM seats
            WHERE status != 'hidden'
         ) s_ordered
         JOIN showtime_seats ss ON s_ordered.id = ss.seat_id
         WHERE ss.booking_id = b.id) as seat_names
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    JOIN showtimes st ON b.showtime_id = st.id
    JOIN movies m ON st.movie_id = m.id
    JOIN cinemas c ON st.cinema_id = c.id

    ${whereString}
    ORDER BY b.created_at DESC
    `;
        const [rows] = await db.query(query, params);
        return rows;
    },
    getFilterOptions: async () => {
        const [branches] = await db.query("SELECT id, name FROM branches ORDER BY name");
        const [cinemas] = await db.query("SELECT id, name, branch_id FROM cinemas ORDER BY name");

        // Thử lấy tất cả phim để đảm bảo dữ liệu lên được Frontend trước
        const [movies] = await db.query("SELECT id, title FROM movies WHERE status = 'Published' ORDER BY title");
        return { branches, cinemas, movies };
    },

    // 2. Lấy chi tiết một vé cụ thể (Dùng cho Email và Trang thành công)
    findById: async (id) => {
        const query = `
    SELECT 
        b.*, 
        COALESCE(b.ticket_code, CAST(b.id AS CHAR)) as ticket_id,
        b.is_printed,
        b.printed_at,
        b.payment_method,           -- Lấy 'VNPAY' từ bảng bookings
        b.payment_status,
        m.title, 
        m.poster as poster_url, 
        m.duration, 
        c.name as cinema_name, 
        c.address as cinema_address,
        m.genre as movie_genres,   -- Đổi m.genres thành m.genre theo ảnh DB
        m.rating as rating,         -- Giữ nguyên m.rating
        CONCAT(r.room_type, ' ', st.format) as movie_format,
        r.name as room_name, -- LẤY TÊN PHÒNG ĐỂ HIỂN THỊ TRÊN EMAIL
        st.start_time, 
        st.show_date,
        u.fullName as user_name, 
        u.email as user_email, 
        u.phone as user_phone,
        (SELECT GROUP_CONCAT(
            CASE 
                WHEN s_ordered.type = 'couple' THEN CONCAT(s_ordered.row_label, s_ordered.real_number, '-', s_ordered.row_label, s_ordered.real_number + 1)
                ELSE CONCAT(s_ordered.row_label, s_ordered.real_number)
            END 
            ORDER BY s_ordered.row_label, s_ordered.real_number SEPARATOR ', '
         )
         FROM (
            SELECT 
                id, row_label, type, template_id, col_index,
                ROW_NUMBER() OVER (PARTITION BY template_id, row_label ORDER BY col_index ASC) as real_number
            FROM seats
            WHERE status != 'hidden'
         ) s_ordered
         JOIN showtime_seats ss ON s_ordered.id = ss.seat_id
         WHERE ss.booking_id = b.id) as seat_names
    FROM bookings b
    JOIN showtimes st ON b.showtime_id = st.id
    JOIN movies m ON st.movie_id = m.id
    JOIN rooms r ON st.room_id = r.id -- JOIN THÊM BẢNG ROOMS
    JOIN cinemas c ON st.cinema_id = c.id
    JOIN users u ON b.user_id = u.id
    WHERE b.id = ? OR b.ticket_code = ?`;
        const [rows] = await db.query(query, [id, id]);
        return rows[0];
    },

    findCombosByTicketId: async (id) => {
        try {
            const [combos] = await db.query(`
            SELECT 
                ci.quantity, 
                cb.name as combo_name, 
                cb.sale_price, 
                cb.image
            FROM combo_items ci
            JOIN combos cb ON ci.combo_id = cb.id
            WHERE ci.booking_id = ?`, [id]); // ĐẢM BẢO CỘT NÀY CÓ TRONG BẢNG combo_items
            return combos;
        } catch (error) {
            console.error("Lỗi lấy combo từ DB:", error.message);
            return [];
        }
    },
    updateStatus: async (id, status) => {
        try {
            const query = `UPDATE bookings SET payment_status = ? WHERE id = ?`;
            const [result] = await db.query(query, [status, id]);

            // Trả về true nếu có 1 dòng được cập nhật, ngược lại false
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái vé:", error.message);
            throw error;
        }
    },

    updatePrintedStatus: async (id) => {
        try {
            const query = `UPDATE bookings SET is_printed = 1, printed_at = NOW() 
            WHERE id = ? OR CONCAT(DATE_FORMAT(created_at, '%d%m'), LPAD(id, 4, '0')) = ?`;
            const [result] = await db.query(query, [id, id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái in vé:", error.message);
            throw error;
        }
    }


};

module.exports = Ticket;