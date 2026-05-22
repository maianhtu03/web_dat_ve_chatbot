const db = require('../config/db');

const ticketStatisticsModel = {
    // 1. Phân loại vé
    getTicketTypeDistribution: async (startDate, endDate, branchId, cinemaId) => {
        const query = `
            SELECT s.type as name, COUNT(ss.id) as value
            FROM bookings b
            JOIN showtime_seats ss ON b.id = ss.booking_id
            JOIN seats s ON ss.seat_id = s.id
            JOIN showtimes st ON b.showtime_id = st.id
            WHERE b.payment_status = 'paid'
            AND DATE(b.created_at) BETWEEN ? AND ?
            ${branchId ? 'AND st.branch_id = ?' : ''}
            ${cinemaId ? 'AND st.cinema_id = ?' : ''}
            GROUP BY s.type`;

        const params = [startDate, endDate];
        if (branchId) params.push(branchId);
        if (cinemaId) params.push(cinemaId);

        const [rows] = await db.query(query, params);
        return rows;
    },

    // 2. Giờ cao điểm
    getPeakBookingHours: async (startDate, endDate, branchId, cinemaId) => {
        const query = `
            SELECT DATE_FORMAT(b.created_at, '%H:00') as hour, COUNT(b.id) as count
            FROM bookings b
            JOIN showtimes st ON b.showtime_id = st.id
            WHERE b.payment_status = 'paid'
            AND DATE(b.created_at) BETWEEN ? AND ?
            ${branchId ? 'AND st.branch_id = ?' : ''}
            ${cinemaId ? 'AND st.cinema_id = ?' : ''}
            GROUP BY hour
            ORDER BY hour ASC`;

        const params = [startDate, endDate];
        if (branchId) params.push(branchId);
        if (cinemaId) params.push(cinemaId);

        const [rows] = await db.query(query, params);
        return rows;
    },

    // 3. Tỷ lệ lấp đầy - ĐÃ SỬA LOGIC ĐỂ KHÔNG MẤT DỮ LIỆU
    getTheaterOccupancyRates: async (startDate, endDate, branchId, cinemaId) => {
        const query = `
        SELECT 
            theater_info.name as theater,
            SUM(theater_info.booked_count) as booked,
            SUM(theater_info.capacity) as total_seats,
            (SUM(theater_info.capacity) - SUM(theater_info.booked_count)) as \`empty\`,
            CASE 
                WHEN SUM(theater_info.capacity) > 0 THEN 
                    ROUND((SUM(theater_info.booked_count) / SUM(theater_info.capacity)) * 100, 2)
                ELSE 0 
            END as occupancyRate
        FROM (
            SELECT 
                c.id,
                c.name,
                st.id as showtime_id,
                -- 1. Lấy capacity trực tiếp từ template của phòng chiếu đó
                tp.capacity,
                -- 2. Đếm số ghế đã được đặt cho suất chiếu này
                (SELECT COUNT(*) 
                 FROM showtime_seats ss 
                 JOIN bookings b ON ss.booking_id = b.id 
                 WHERE ss.showtime_id = st.id 
                 AND b.payment_status = 'paid') as booked_count
            FROM cinemas c
            JOIN showtimes st ON c.id = st.cinema_id
            JOIN rooms r ON st.room_id = r.id
            JOIN seat_templates tp ON r.template_id = tp.id
            WHERE DATE(st.show_date) BETWEEN ? AND ?
            ${branchId ? 'AND c.branch_id = ?' : ''}
            ${cinemaId ? 'AND c.id = ?' : ''}
        ) theater_info
        GROUP BY theater_info.id, theater_info.name`;

        const params = [startDate, endDate];
        if (branchId) params.push(branchId);
        if (cinemaId) params.push(cinemaId);

        const [rows] = await db.query(query, params);
        return rows;
    },

    // 4. Xu hướng vé bán
    getTicketTrend: async (startDate, endDate, branchId, cinemaId) => {
        const query = `
            SELECT 
                DATE_FORMAT(b.created_at, '%d/%m') as date, 
                COUNT(b.id) as count
            FROM bookings b
            JOIN showtimes st ON b.showtime_id = st.id
            WHERE b.payment_status = 'paid'
            AND DATE(b.created_at) BETWEEN ? AND ?
            ${branchId ? 'AND st.branch_id = ?' : ''}
            ${cinemaId ? 'AND st.cinema_id = ?' : ''}
            GROUP BY date, DATE(b.created_at)
            ORDER BY DATE(b.created_at) ASC`;

        const params = [startDate, endDate];
        if (branchId) params.push(branchId);
        if (cinemaId) params.push(cinemaId);

        const [rows] = await db.query(query, params);
        return rows;
    },

    // 5. Top phim
    getTopMovies: async (startDate, endDate, branchId, cinemaId) => {
        const query = `
            SELECT m.title as name, COUNT(ss.id) as value
            FROM movies m
            JOIN showtimes st ON m.id = st.movie_id
            JOIN showtime_seats ss ON st.id = ss.showtime_id
            JOIN bookings b ON ss.booking_id = b.id
            WHERE b.payment_status = 'paid'
            AND DATE(b.created_at) BETWEEN ? AND ?
            ${branchId ? 'AND st.branch_id = ?' : ''}
            ${cinemaId ? 'AND st.cinema_id = ?' : ''}
            GROUP BY m.id, m.title
            ORDER BY value DESC
            LIMIT 5`;

        const params = [startDate, endDate];
        if (branchId) params.push(branchId);
        if (cinemaId) params.push(cinemaId);

        const [rows] = await db.query(query, params);
        return rows;
    },

    getAllBranches: async () => {
        const [rows] = await db.query('SELECT id, name FROM branches');
        return rows;
    },

    getCinemasByBranch: async (branchId) => {
        let sql = 'SELECT id, name FROM cinemas';
        const params = [];
        if (branchId) {
            sql += ' WHERE branch_id = ?';
            params.push(branchId);
        }
        const [rows] = await db.query(sql, params);
        return rows;
    }
};

module.exports = ticketStatisticsModel;