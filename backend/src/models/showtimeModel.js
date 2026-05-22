const db = require('../config/db');
// --- HÀM TRỢ GIÚP: TÍNH SỐ GHẾ LỖI (GHẾ ĐÔI LẺ) ---
const countInvalidCoupleSeats = (seats) => {
    let invalidCount = 0;
    const rows = {};

    // Nhóm ghế theo hàng
    seats.forEach(s => {
        if (!rows[s.row_label]) rows[s.row_label] = [];
        rows[s.row_label].push(s);
    });

    // Duyệt từng hàng để tìm ghế đôi không có cặp
    Object.values(rows).forEach(rowSeats => {
        // Sắp xếp theo cột để đảm bảo thứ tự
        rowSeats.sort((a, b) => a.col_index - b.col_index);

        for (let i = 0; i < rowSeats.length; i++) {
            if (rowSeats[i].type === 'couple') {
                // Kiểm tra xem ghế tiếp theo có phải là "nửa kia" của ghế đôi không
                if (rowSeats[i + 1] && rowSeats[i + 1].type === 'couple') {
                    i++; // Cặp hợp lệ, nhảy qua ghế tiếp theo
                } else {
                    invalidCount++; // Ghế đôi bị lẻ, tính là 1 ghế lỗi
                }
            }
        }
    });
    return invalidCount;
};
const Showtime = {
    getAll: async (date, movieId, cinemaId, status) => {
        let query = `
            SELECT st.*, m.title as movie_title,m.poster, m.duration, m.genre,
                   r.name as room_name, r.room_type,r.template_id, b.name as branch_name,c.name as cinema_name
            FROM showtimes st
            JOIN movies m ON st.movie_id = m.id
            JOIN rooms r ON st.room_id = r.id
            JOIN branches b ON st.branch_id = b.id
            LEFT JOIN cinemas c ON st.cinema_id = c.id
            WHERE 1=1
        `;
        const params = [];
        // Lọc theo ngày (quan trọng nhất cho lịch chiếu)
        if (date) {
            query += ` AND st.show_date = ?`;
            params.push(date);
        }
        // Lọc theo phim
        if (movieId) {
            query += ` AND st.movie_id = ?`;
            params.push(movieId);
        }
        // Lọc theo chi nhánh
        if (cinemaId) {
            query += ` AND st.cinema_id = ?`;
            params.push(cinemaId);
        }
        // THÊM: Lọc theo trạng thái
        if (status) {
            query += ` AND st.status = ?`;
            params.push(status);
        }
        query += ` ORDER BY st.show_date DESC, st.start_time ASC`;
        const [rows] = await db.execute(query, params);
        // --- BỔ SUNG: Tính ghế trống cho từng suất chiếu (An toàn cho logic cũ) ---
        for (let row of rows) {
            try {
                // 1. Lấy TẤT CẢ ghế active của template để kiểm tra logic ghế đôi lẻ
                const [allActiveSeats] = await db.execute(
                    "SELECT row_label, col_index, type FROM seats WHERE template_id = ? AND status = 'active' AND is_broken = 0",
                    [row.template_id]
                );

                const invalidCount = countInvalidCoupleSeats(allActiveSeats);
                const totalValidSeats = allActiveSeats.length - invalidCount;

                // 2. Ghế đã chiếm (Booked hoặc Reserved còn hạn)
                const [occupied] = await db.execute(
                    `SELECT COUNT(*) as count FROM showtime_seats 
                     WHERE showtime_id = ? AND (status = 'booked' OR (status = 'reserved' AND hold_expires_at > NOW()))`,
                    [row.id]
                );
                const occupiedCount = occupied[0].count || 0;

                // 3. Kết quả cuối cùng: Lấy tổng ghế chuẩn trừ đi ghế đã ngồi
                row.total_seats = totalValidSeats;
                row.booked_seats = occupiedCount;
                row.available_seats = Math.max(0, totalValidSeats - occupiedCount);

            } catch (err) {
                console.error("Lỗi tính ghế:", err);
                row.available_seats = 0;
            }
        }
        return rows;
    },
    // Thêm hàm delete vào đây
    delete: async (id) => {
        try {
            const query = `DELETE FROM showtimes WHERE id = ?`;
            const [result] = await db.execute(query, [id]);
            return result;
        } catch (error) {
            console.error("Lỗi tại Showtime Model (delete):", error.message);
            throw error;
        }
    },
    getById: async (id) => {
        const query = `
            SELECT
            st.*,
            st.cinema_id,             -- CHUẨN: Lấy trực tiếp từ bảng showtimes
            m.title as movie_title,
            m.poster,
            m.rating as movie_rating,
            m.genre,
            m.duration,
            m.versions,
            r.name as room_name,
            r.room_type,
            r.template_id,
            b.name as branch_name,
            c.name as cinema_name
        FROM showtimes st
        JOIN movies m ON st.movie_id = m.id
        JOIN rooms r ON st.room_id = r.id
        JOIN branches b ON st.branch_id = b.id
        LEFT JOIN cinemas c ON st.cinema_id = c.id  -- CHUẨN: Join qua st.cinema_id
        WHERE st.id = ?
        `;
        const [rows] = await db.execute(query, [id]);
        if (rows.length === 0) return null;

        const row = rows[0];
        try {
            // Tương tự hàm getAll, tính toán lại dựa trên danh sách ghế thực tế
            const [allActiveSeats] = await db.execute(
                "SELECT row_label, col_index, type FROM seats WHERE template_id = ? AND status = 'active' AND is_broken = 0",
                [row.template_id]
            );

            const invalidCount = countInvalidCoupleSeats(allActiveSeats);
            const totalValidSeats = allActiveSeats.length - invalidCount;

            const [occupied] = await db.execute(
                `SELECT COUNT(*) as count FROM showtime_seats 
                 WHERE showtime_id = ? AND (status = 'booked' OR (status = 'reserved' AND hold_expires_at > NOW()))`,
                [row.id]
            );
            const occupiedCount = occupied[0].count || 0;
            row.total_seats = totalValidSeats;
            row.booked_seats = occupiedCount;
            row.available_seats = Math.max(0, totalValidSeats - occupiedCount);
        } catch (err) {
            row.available_seats = 0;
        }

        return row;
    },
    getScheduleByCinema: async (cinemaId, date) => {
        const query = `
        SELECT 
            m.id as movie_id, m.title, m.poster, m.genre, m.duration, m.rating as movie_rating,
            st.id as showtime_id, st.start_time, st.format, st.room_id, 
            r.name as room_name, r.template_id
        FROM showtimes st
        JOIN movies m ON st.movie_id = m.id
        JOIN rooms r ON st.room_id = r.id
        WHERE st.cinema_id = ? 
          AND st.show_date = ? 
          AND st.status = 'Active'
        ORDER BY m.id, st.start_time ASC
    `;
        const [rows] = await db.execute(query, [cinemaId, date]);

        const movieMap = {};

        for (let row of rows) {
            // Nếu phim chưa có trong Map thì khởi tạo
            if (!movieMap[row.movie_id]) {
                movieMap[row.movie_id] = {
                    movie_id: row.movie_id,
                    title: row.title,
                    poster: row.poster,
                    genre: row.genre,
                    duration: row.duration,
                    rating: row.movie_rating,
                    formats: {} // Nhóm theo '2D PHỤ ĐỀ', '2D LỒNG TIẾNG', v.v.
                };
            }

            const formatKey = row.format || '2D';
            if (!movieMap[row.movie_id].formats[formatKey]) {
                movieMap[row.movie_id].formats[formatKey] = [];
            }

            // TÍNH GHẾ TRỐNG (Tái sử dụng logic an toàn của bạn)
            const [allActiveSeats] = await db.execute(
                "SELECT row_label, col_index, type FROM seats WHERE template_id = ? AND status = 'active' AND is_broken = 0",
                [row.template_id]
            );
            const invalidCount = countInvalidCoupleSeats(allActiveSeats);
            const totalValidSeats = allActiveSeats.length - invalidCount;

            const [occupied] = await db.execute(
                `SELECT COUNT(*) as count FROM showtime_seats 
             WHERE showtime_id = ? AND (status = 'booked' OR (status = 'reserved' AND hold_expires_at > NOW()))`,
                [row.showtime_id]
            );
            const occupiedCount = occupied[0].count || 0;
            // Đẩy suất chiếu vào đúng nhóm định dạng của phim đó
            movieMap[row.movie_id].formats[formatKey].push({
                showtime_id: row.showtime_id,
                start_time: row.start_time.substring(0, 5), // Lấy HH:mm
                room_name: row.room_name,
                total_seats: totalValidSeats,
                booked_seats: occupiedCount,
                available_seats: Math.max(0, totalValidSeats - occupiedCount)
            });
        }

        // Chuyển đối tượng Map thành mảng để Frontend dễ map()
        return Object.values(movieMap);
    },
    // ĐÃ SỬA: Lấy thêm movie_title để hiện thị ở cột bên phải FE
    getByRoom: async (roomId, date, endDate = null) => {
        let query = `
        SELECT st.id, st.start_time, st.end_time, st.show_date, m.title as movie_title
        FROM showtimes st
        JOIN movies m ON st.movie_id = m.id
        WHERE st.room_id = ?
    `;
        const params = [roomId];
        if (endDate) {
            // Nếu có endDate -> Dùng BETWEEN để lấy toàn bộ suất chiếu trong khoảng ngày
            query += ` AND st.show_date BETWEEN ? AND ? `;
            params.push(date, endDate);
        } else {
            // Nếu không có endDate -> Chỉ lấy 1 ngày như cũ
            query += ` AND st.show_date = ? `;
            params.push(date);
        }
        query += ` ORDER BY st.show_date ASC, st.start_time ASC `;
        const [rows] = await db.execute(query, params);
        return rows;
    },
    // ĐÃ SỬA: Logic kiểm tra trùng lịch chuẩn
    // Kiểm tra trùng lịch: Nếu có bất kỳ suất nào giao thoa với khoảng [startTime, endTime]
    // Thêm tham số excludeId vào cuối hàm
    checkConflict: async (roomId, showDate, startTime, endTime, excludeId = null) => {
        let query = `
        SELECT st.id, st.start_time, m.title as movie_title
        FROM showtimes st
        JOIN movies m ON st.movie_id = m.id
        WHERE st.room_id = ?
        AND st.show_date = ?
        AND st.status != 'Cancelled'
        AND (st.start_time < ? AND st.end_time > ?)
    `;
        const params = [roomId, showDate, endTime, startTime];
        // CỰC KỲ QUAN TRỌNG: Nếu có truyền excludeId (trường hợp Update),
        // thì phải loại trừ ID đó ra khỏi danh sách kiểm tra trùng
        if (excludeId) {
            query += ` AND st.id != ? `;
            params.push(excludeId);
        }
        query += ` LIMIT 1 `;
        const [rows] = await db.execute(query, params);
        return rows.length > 0 ? rows[0] : null;
    },
    // Thêm hàm này để chèn nhiều suất cùng lúc (Tối ưu cho Auto)
    createMany: async (showtimes) => {
        // showtimes là mảng các mảng: [[movie_id, room_id, ...], [movie_id, room_id, ...]]
        const query = `
            INSERT INTO showtimes (movie_id, room_id, branch_id,cinema_id, show_date, start_time, end_time, format, status)
            VALUES ?
        `;
        const [result] = await db.query(query, [showtimes]);
        return result;
    },
    update: async (id, data) => {
        // 1. Lấy dữ liệu từ data. Lưu ý: FE có thể gửi start_time trực tiếp hoặc qua manualTimes[0]
        const movie_id = data.movie_id;
        const room_id = data.room_id;
        const branch_id = data.branch_id;
        const cinema_id = data.cinema_id;
        const show_date = data.show_date;
        const format = data.format;
        // 2. Logic xử lý giờ: Nếu FE gửi manualTimes (mảng), lấy phần tử đầu tiên.
        // Nếu không, lấy start_time trực tiếp.
        let start_time = data.start_time;
        if (data.manualTimes && data.manualTimes.length > 0) {
            start_time = data.manualTimes[0];
        }
        const end_time = data.end_time; // Đảm bảo FE có tính toán và gửi end_time
        const query = `
        UPDATE showtimes
        SET movie_id = ?, room_id = ?, branch_id = ?, cinema_id = ?,
            show_date = ?, start_time = ?, end_time = ?, format = ?
        WHERE id = ?
    `;
        const [result] = await db.execute(query, [
            movie_id, room_id, branch_id, cinema_id,
            show_date, start_time, end_time, format, id
        ]);
        return result;
    },
    // ĐÃ SỬA: Bỏ base_price nếu DB của bạn không có cột này
    create: async (data) => {
        const { movie_id, room_id, branch_id, cinema_id, show_date, start_time, end_time, format } = data;
        const query = `
        INSERT INTO showtimes (movie_id, room_id, branch_id,cinema_id, show_date, start_time, end_time, format, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')
    `;
        // Xóa base_price khỏi mảng tham số truyền vào bên dưới
        const [result] = await db.execute(query, [movie_id, room_id, branch_id, cinema_id, show_date, start_time, end_time, format || '2D']);
        return result.insertId;
    },
    updateStatus: async (id, status) => {
        const query = `
            UPDATE showtimes
            SET status = ?
            WHERE id = ?
        `;
        // Sử dụng db.execute để thực thi câu lệnh updat
        const [result] = await db.execute(query, [status, id]);
        return result;
    },
    // Thêm vào trong đối tượng Showtime = { ... }
    // Thêm vào trong đối tượng Showtime = { ... }
    getSeatStates: async (showtimeId, templateId) => {
        try {
            // 1. TỰ ĐỘNG GIẢI PHÓNG GHẾ HẾT HẠN (Quan trọng nhất)
            // Quét và đưa các ghế 'reserved' quá 10 phút về trạng thái 'available'
            await db.execute(
                `UPDATE showtime_seats 
             SET status = 'available', booking_id = NULL, hold_expires_at = NULL 
             WHERE showtime_id = ? AND status = 'reserved' AND hold_expires_at < NOW()`,
                [showtimeId]
            );

            // 2. Lấy tất cả ghế theo mẫu của phòng (Giữ nguyên logic của bạn)
            const [allSeats] = await db.execute(
                `SELECT id, row_label, seat_number, type, status, is_broken, row_index, col_index
             FROM seats
             WHERE template_id = ?
             ORDER BY row_index ASC, col_index ASC`,
                [templateId]
            );

            // 3. Lấy trạng thái thực tế của các ghế trong suất chiếu này (booked + reserved)
            const [showtimeSeats] = await db.execute(
                `SELECT seat_id, status FROM showtime_seats WHERE showtime_id = ?`,
                [showtimeId]
            );

            // Chuyển danh sách showtime_seats thành một Object Map để tra cứu nhanh hơn
            const seatStatusMap = {};
            showtimeSeats.forEach(s => {
                seatStatusMap[s.seat_id] = s.status;
            });

            // 4. Trộn dữ liệu để trả về cho Frontend
            return allSeats.map(seat => {
                const currentStatus = seatStatusMap[seat.id] || 'available';

                const isBooked = currentStatus === 'booked';
                const isReserved = currentStatus === 'reserved'; // Trạng thái giữ ghế (Xanh nhạt)
                const isMaintenance = seat.status === 'maintenance' || seat.status === 'inactive';
                const isBroken = seat.is_broken === 1;

                return {
                    ...seat,
                    // Giữ lại các biến cũ để không hỏng Frontend hiện tại
                    is_booked: isBooked ? 1 : 0,
                    isBooked: isBooked,
                    isMaintenance: isMaintenance,
                    isBroken: isBroken,

                    // Thêm biến mới để FE tô màu xanh nhạt
                    isReserved: isReserved,

                    // Cập nhật lại logic có được chọn hay không:
                    // Ghế chọn được nếu: Active + Không hỏng + Không đã đặt + Không đang bị giữ
                    isSelectable: !isBroken && !isBooked && !isReserved && seat.status === 'active'
                };
            });
        } catch (error) {
            console.error("Lỗi tại getSeatStates Model:", error.message);
            throw error;
        }
    }
};
module.exports = Showtime;
