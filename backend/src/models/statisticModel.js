const db = require('../config/db');

const statisticModel = {
    // 1. Thống kê thẻ (Cards) - Đã tích hợp lọc Chi nhánh, Rạp và Ngày
    getStats: async (branchId, cinemaId, startDate, endDate) => {
        const query = `
            SELECT 
                (SELECT IFNULL(SUM(b.total_price), 0) FROM bookings b 
                 JOIN showtimes s ON b.showtime_id = s.id 
                 WHERE b.payment_status = 'paid' 
                 AND (? IS NULL OR s.branch_id = ?) 
                 AND (? IS NULL OR s.cinema_id = ?)
                 AND DATE(b.created_at) BETWEEN ? AND ?) as revenue,

                (SELECT COUNT(ss.id) FROM showtime_seats ss
         JOIN bookings b ON ss.booking_id = b.id
         JOIN showtimes s ON b.showtime_id = s.id
         WHERE b.payment_status = 'paid' 
         AND ss.status = 'booked'
         AND (? IS NULL OR s.branch_id = ?) 
         AND (? IS NULL OR s.cinema_id = ?)
         AND DATE(b.created_at) BETWEEN ? AND ?) as tickets,

                (SELECT COUNT(*) FROM showtimes s 
                 WHERE (? IS NULL OR s.branch_id = ?) 
                 AND (? IS NULL OR s.cinema_id = ?)
                 AND s.show_date BETWEEN ? AND ?) as shows,

                (SELECT COUNT(*) FROM users WHERE DATE(createdAt) BETWEEN ? AND ?) as users
        `;

        // Mảng tham số tương ứng với các dấu chấm hỏi
        const params = [
            branchId, branchId, cinemaId, cinemaId, startDate, endDate, // cho revenue
            branchId, branchId, cinemaId, cinemaId, startDate, endDate, // cho tickets
            branchId, branchId, cinemaId, cinemaId, startDate, endDate, // cho shows
            startDate, endDate // cho users (User thường không lọc theo rạp)
        ];

        const [rows] = await db.query(query, params);
        return rows[0] || { revenue: 0, tickets: 0, shows: 0, users: 0 };
    },

    // 2. Doanh thu theo biểu đồ (Lọc theo chi nhánh/rạp và khoảng ngày)
    getRevenueChart: async (branchId, cinemaId, startDate, endDate) => {
        const query = `
            SELECT DATE_FORMAT(b.created_at, '%d/%m') as date, SUM(b.total_price) as total
            FROM bookings b
            JOIN showtimes s ON b.showtime_id = s.id
            WHERE b.payment_status = 'paid'
            AND (? IS NULL OR s.branch_id = ?)
            AND (? IS NULL OR s.cinema_id = ?)
            AND DATE(b.created_at) BETWEEN ? AND ?
            GROUP BY date
            ORDER BY MIN(b.created_at) ASC
        `;
        const [rows] = await db.query(query, [branchId, branchId, cinemaId, cinemaId, startDate, endDate]);
        return rows || [];
    },

    // 3. Trạng thái suất chiếu
    getShowtimeStatus: async (branchId, cinemaId, startDate, endDate) => {
        const query = `
        SELECT 
            -- Upcoming: Những suất chiếu có thời gian bắt đầu sau thời điểm hiện tại
            COUNT(CASE 
                WHEN TIMESTAMP(s.show_date, s.start_time) > NOW() 
                THEN 1 END) as upcoming,
            
            -- Live: Thời điểm hiện tại nằm giữa bắt đầu và kết thúc của suất chiếu
            COUNT(CASE 
                WHEN NOW() BETWEEN TIMESTAMP(s.show_date, s.start_time) 
                               AND TIMESTAMP(s.show_date, s.end_time) 
                THEN 1 END) as live,

            -- Finished: Những suất đã kết thúc trước thời điểm hiện tại
            COUNT(CASE 
                WHEN TIMESTAMP(s.show_date, s.end_time) < NOW() 
                THEN 1 END) as finished
        FROM showtimes s
        WHERE (? IS NULL OR s.branch_id = ?)
        AND (? IS NULL OR s.cinema_id = ?)
        AND s.show_date BETWEEN ? AND ?
    `;
        const [rows] = await db.query(query, [branchId, branchId, cinemaId, cinemaId, startDate, endDate]);
        return rows[0] || { upcoming: 0, live: 0, finished: 0 };
    },

    // 4. Top phim doanh thu cao nhất theo bộ lọc
    getTopMovies: async (branchId, cinemaId, startDate, endDate) => {
        const query = `
            SELECT m.title, IFNULL(SUM(b.total_price), 0) as revenue
            FROM movies m
            JOIN showtimes s ON m.id = s.movie_id
            JOIN bookings b ON s.id = b.showtime_id
            WHERE b.payment_status = 'paid'
            AND (? IS NULL OR s.branch_id = ?)
            AND (? IS NULL OR s.cinema_id = ?)
            AND DATE(b.created_at) BETWEEN ? AND ?
            GROUP BY m.id, m.title
            ORDER BY revenue DESC
            LIMIT 5
        `;
        const [rows] = await db.query(query, [branchId, branchId, cinemaId, cinemaId, startDate, endDate]);
        return rows || [];
    },

    // 5. Heatmap (Phân bổ suất chiếu)
    getShowtimeHeatmap: async (branchId, cinemaId, startDate, endDate) => {
        const query = `
            SELECT 
                DAYNAME(s.show_date) as day_of_week,
                HOUR(s.start_time) as show_hour,
                COUNT(*) as count
            FROM showtimes s
            WHERE (? IS NULL OR s.branch_id = ?)
            AND (? IS NULL OR s.cinema_id = ?)
            AND s.show_date BETWEEN ? AND ?
            GROUP BY day_of_week, show_hour
            ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), show_hour
        `;
        const [rows] = await db.query(query, [branchId, branchId, cinemaId, cinemaId, startDate, endDate]);
        return rows || [];
    },
    getAllBranches: async () => {
        const [rows] = await db.query("SELECT id, name FROM branches");
        return rows;
    },

    getCinemasByBranch: async (branchId) => {
        // Nếu chọn 'all' thì lấy hết, nếu có ID thì lọc theo chi nhánh
        let query = "SELECT id, name FROM cinemas";
        let params = [];

        if (branchId !== 'all') {
            query += " WHERE branch_id = ?";
            params.push(branchId);
        }

        const [rows] = await db.query(query, params);
        return rows;
    }

};

module.exports = statisticModel;