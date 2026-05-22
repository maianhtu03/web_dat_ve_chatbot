const pool = require('../config/db');

const MovieStatisticsModel = {
    // 1. Lấy dữ liệu tổng quan (5 Thẻ Card)
    // MovieStatisticsModel.js

    getSummary: async (startDate, endDate, branchId, cinemaId) => {
        // 1. Xử lý điều kiện lọc địa điểm trước
        let locationJoin = "";
        let locationWhere = "";
        const locationParams = [];

        if (branchId && branchId !== 'all') {
            locationJoin = `
            INNER JOIN showtimes s_loc ON m.id = s_loc.movie_id
            INNER JOIN rooms r_loc ON s_loc.room_id = r_loc.id
            INNER JOIN cinemas c_loc ON r_loc.cinema_id = c_loc.id
        `;
            locationWhere = ` AND c_loc.branch_id = ? `;
            locationParams.push(branchId);
        } else if (cinemaId && cinemaId !== 'all') {
            locationJoin = `
            INNER JOIN showtimes s_loc ON m.id = s_loc.movie_id
            INNER JOIN rooms r_loc ON s_loc.room_id = r_loc.id
        `;
            locationWhere = ` AND r_loc.cinema_id = ? `;
            locationParams.push(cinemaId);
        }

        // 2. Query chính sử dụng Subquery hoặc GROUP BY chuẩn để tránh nhân dòng
        const query = `
        SELECT 
            -- Tổng số phim (chỉ đếm phim có tồn tại theo rạp/chi nhánh đã chọn)
            COUNT(DISTINCT m.id) as totalMovies,

            -- Phim ĐANG CHIẾU: release_date <= hiện tại <= end_date
            COUNT(DISTINCT CASE 
                WHEN CURDATE() >= m.release_date AND (m.end_date IS NULL OR CURDATE() <= m.end_date) 
                THEN m.id END) as currentlyShowing,

            -- Phim SẮP CHIẾU: hiện tại < release_date
            COUNT(DISTINCT CASE 
                WHEN CURDATE() < m.release_date 
                THEN m.id END) as comingSoon,

            -- Phim HOT nhất (Không phụ thuộc vào filter địa điểm)
            (
                SELECT m2.title FROM movies m2
                JOIN showtimes s2 ON m2.id = s2.movie_id
                JOIN bookings b2 ON s2.id = b2.showtime_id
                WHERE m2.is_hot = 1 AND b2.payment_status = 'paid'
                GROUP BY m2.id ORDER BY SUM(b2.total_price) DESC LIMIT 1
            ) as topHotMovie,

            -- Phim BÁN CHẠY NHẤT (Theo khoảng ngày lọc)
            (
                SELECT m3.title FROM movies m3
                JOIN showtimes s3 ON m3.id = s3.movie_id
                JOIN bookings b3 ON s3.id = b3.showtime_id
                WHERE b3.payment_status = 'paid' 
                  AND DATE(b3.created_at) BETWEEN ? AND ?
                GROUP BY m3.id ORDER BY COUNT(b3.id) DESC LIMIT 1
            ) as bestSellerMovie

        FROM movies m
        ${locationJoin}
        WHERE 1=1 ${locationWhere}
    `;

        // Tham số truyền vào: [startDate, endDate, ...locationParams]
        const finalParams = [startDate, endDate, ...locationParams];

        const [rows] = await pool.query(query, finalParams);
        return rows[0];
    },

    getRevenueByCinema: async (startDate, endDate, branchId, cinemaId) => {
        let query = `
        SELECT 
            cn.name as cinemaName,
            m.title as movieTitle,
            SUM(b.total_price) as revenue
        FROM bookings b
        INNER JOIN showtimes s ON b.showtime_id = s.id
        INNER JOIN movies m ON s.movie_id = m.id
        INNER JOIN rooms r ON s.room_id = r.id
        INNER JOIN cinemas cn ON r.cinema_id = cn.id
        WHERE b.payment_status = 'paid'
          AND DATE(b.created_at) BETWEEN ? AND ?
    `;

        const params = [startDate, endDate];

        // Kiểm tra 'all' để tránh query sai nếu frontend gửi giá trị mặc định
        if (branchId && branchId !== 'all') {
            query += ` AND cn.branch_id = ?`;
            params.push(branchId);
        }
        if (cinemaId && cinemaId !== 'all') {
            query += ` AND cn.id = ?`;
            params.push(cinemaId);
        }

        // Thêm cn.name vào Group By để chuẩn hóa SQL
        query += ` GROUP BY cn.id, cn.name, m.id, m.title`;

        const [rows] = await pool.query(query, params);

        // Xử lý dữ liệu để phù hợp với Stacked Bar Chart
        return rows.reduce((acc, row) => {
            let cinema = acc.find(item => item.cinemaName === row.cinemaName);
            if (!cinema) {
                cinema = { cinemaName: row.cinemaName };
                acc.push(cinema);
            }
            // Gán doanh thu cho movieTitle tương ứng
            cinema[row.movieTitle] = Number(row.revenue);
            return acc;
        }, []);
    },
    // 3. Doanh thu theo thể loại (Biểu đồ tròn)
    getGenreStats: async (startDate, endDate, branchId, cinemaId) => {
        let query = `
            SELECT 
                m.genre as name,
                SUM(b.total_price) as value
            FROM bookings b
            JOIN showtimes s ON b.showtime_id = s.id
            JOIN movies m ON s.movie_id = m.id
            JOIN rooms r ON s.room_id = r.id
            JOIN cinemas cn ON r.cinema_id = cn.id
            WHERE b.payment_status = 'paid'
              AND DATE(b.created_at) BETWEEN ? AND ?
        `;

        const params = [startDate, endDate];
        if (branchId) { query += ` AND cn.branch_id = ?`; params.push(branchId); }
        if (cinemaId) { query += ` AND cn.id = ?`; params.push(cinemaId); }

        query += ` GROUP BY m.genre`;
        const [rows] = await pool.query(query, params);
        return rows;
    },

    // 4. Hiệu suất Phim Hot vs Phim Thường (Biểu đồ 3 theo yêu cầu)
    getHotVsNormalStats: async (startDate, endDate, branchId, cinemaId) => {
        let query = `
            SELECT 
                IF(m.is_hot = 1, 'Phim Hot', 'Phim Thường') as name,
                SUM(b.total_price) as value
            FROM bookings b
            JOIN showtimes s ON b.showtime_id = s.id
            JOIN movies m ON s.movie_id = m.id
            JOIN rooms r ON s.room_id = r.id
            JOIN cinemas cn ON r.cinema_id = cn.id
            WHERE b.payment_status = 'paid'
              AND DATE(b.created_at) BETWEEN ? AND ?
        `;

        const params = [startDate, endDate];
        if (branchId) { query += ` AND cn.branch_id = ?`; params.push(branchId); }
        if (cinemaId) { query += ` AND cn.id = ?`; params.push(cinemaId); }

        query += ` GROUP BY m.is_hot`;
        const [rows] = await pool.query(query, params);
        return rows;
    },

    // 5. Top 5 phim có lượt xem (vé) cao nhất (Biểu đồ 4 theo yêu cầu)
    getTopMoviesList: async (startDate, endDate, branchId, cinemaId) => {
        let query = `
        SELECT 
            m.title as name,
            COUNT(ss.id) as value -- Đếm từng dòng ghế trong showtime_seats là đếm từng vé
        FROM showtime_seats ss
        INNER JOIN bookings b ON ss.booking_id = b.id
        INNER JOIN showtimes s ON ss.showtime_id = s.id
        INNER JOIN movies m ON s.movie_id = m.id
        INNER JOIN rooms r ON s.room_id = r.id
        INNER JOIN cinemas cn ON r.cinema_id = cn.id
        WHERE b.payment_status = 'paid' 
          AND ss.status = 'booked' -- Chỉ đếm những ghế đã đặt thành công
          AND DATE(b.created_at) BETWEEN ? AND ?
    `;

        const params = [startDate, endDate];
        if (branchId && branchId !== 'all') {
            query += ` AND cn.branch_id = ?`;
            params.push(branchId);
        }
        if (cinemaId && cinemaId !== 'all') {
            query += ` AND cn.id = ?`;
            params.push(cinemaId);
        }

        query += ` GROUP BY m.id ORDER BY value DESC LIMIT 5`;
        const [rows] = await pool.query(query, params);
        return rows;
    },
    getBranches: async () => {
        const [rows] = await pool.query("SELECT id, name FROM branches ORDER BY name ASC");
        return rows;
    },

    // THÊM HÀM NÀY: Lấy danh sách tất cả rạp cho Filter
    getCinemas: async () => {
        const [rows] = await pool.query("SELECT id, name, branch_id FROM cinemas ORDER BY name ASC");
        return rows;
    },
    getTicketsByMovieStats: async (startDate, endDate, branchId, cinemaId) => {
        let query = `
        SELECT 
            m.title as name, 
            COUNT(ss.id) as tickets -- Đếm từng ghế (vé) bán ra thay vì đếm đơn hàng
        FROM showtime_seats ss
        INNER JOIN bookings b ON ss.booking_id = b.id
        INNER JOIN showtimes s ON ss.showtime_id = s.id
        INNER JOIN movies m ON s.movie_id = m.id
        INNER JOIN rooms r ON s.room_id = r.id
        INNER JOIN cinemas cn ON r.cinema_id = cn.id
        WHERE b.payment_status = 'paid'
          AND ss.status = 'booked' -- Chỉ đếm những ghế đã đặt thành công
          AND DATE(b.created_at) BETWEEN ? AND ?
    `;

        const params = [startDate, endDate];

        if (branchId && branchId !== 'all') {
            query += ` AND cn.branch_id = ?`;
            params.push(branchId);
        }
        if (cinemaId && cinemaId !== 'all') {
            query += ` AND cn.id = ?`;
            params.push(cinemaId);
        }

        query += ` GROUP BY m.id ORDER BY tickets DESC`;

        const [rows] = await pool.query(query, params);
        return rows;
    },
    getRevenueByMovieStats: async (startDate, endDate, branchId, cinemaId) => {
        let query = `
            SELECT 
                m.title as name, 
                SUM(b.total_price) as revenue
            FROM bookings b
            JOIN showtimes s ON b.showtime_id = s.id
            JOIN movies m ON s.movie_id = m.id
            JOIN rooms r ON s.room_id = r.id
            JOIN cinemas cn ON r.cinema_id = cn.id
            WHERE b.payment_status = 'paid'
              AND DATE(b.created_at) BETWEEN ? AND ?
        `;

        const params = [startDate, endDate];
        if (branchId && branchId !== 'all') { query += ` AND cn.branch_id = ?`; params.push(branchId); }
        if (cinemaId && cinemaId !== 'all') { query += ` AND cn.id = ?`; params.push(cinemaId); }

        query += ` GROUP BY m.id ORDER BY revenue DESC`;

        const [rows] = await pool.query(query, params);
        return rows;
    },
    getOccupancyRateByMovie: async (startDate, endDate, branchId, cinemaId) => {
        let query = `
        SELECT 
            m.title as name,
            -- 1. Đếm số vé thực tế đã bán (trạng thái booked)
            COUNT(DISTINCT ss.id) as ticketsSold,
            
            -- 2. Tính tổng sức chứa dựa trên template của phòng (Mẫu số)
            -- Ta lấy SUM của capacity từ template tương ứng với mỗi suất chiếu
            SUM(DISTINCT CASE WHEN s.id IS NOT NULL THEN stp.capacity ELSE 0 END) as totalCapacity,

            -- 3. Tính tỷ lệ %
            ROUND(
                (COUNT(DISTINCT ss.id) / 
                NULLIF(SUM(DISTINCT CASE WHEN s.id IS NOT NULL THEN stp.capacity ELSE 0 END), 0)
                ) * 100, 2
            ) as occupancyRate
        FROM movies m
        INNER JOIN showtimes s ON m.id = s.movie_id
        INNER JOIN rooms r ON s.room_id = r.id
        INNER JOIN seat_templates stp ON r.template_id = stp.id -- Join để lấy capacity
        INNER JOIN cinemas cn ON r.cinema_id = cn.id
        -- Chỉ đếm các ghế đã booked thành công
        LEFT JOIN showtime_seats ss ON s.id = ss.showtime_id AND ss.status = 'booked'
        LEFT JOIN bookings b ON ss.booking_id = b.id
        WHERE DATE(s.start_time) BETWEEN ? AND ?
          AND (b.payment_status = 'paid' OR ss.id IS NULL)
    `;

        const params = [startDate, endDate];

        if (branchId && branchId !== 'all') {
            query += ` AND cn.branch_id = ?`;
            params.push(branchId);
        }
        if (cinemaId && cinemaId !== 'all') {
            query += ` AND cn.id = ?`;
            params.push(cinemaId);
        }

        // Quan trọng: Phải Group By theo m.id và s.id trước để tính tổng capacity không bị nhân dòng
        // Sau đó mới tính tổng theo phim. Để đơn giản và chính xác nhất cho MariaDB/MySQL:
        query += ` GROUP BY m.id ORDER BY occupancyRate DESC`;

        const [rows] = await pool.query(query, params);
        return rows;
    }
};

module.exports = MovieStatisticsModel;