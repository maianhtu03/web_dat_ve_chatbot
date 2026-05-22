const pool = require('../config/db');

const ShowtimeStatisticsModel = {
    // 1. KPI 5 thẻ Card - Đã gia cố IFNULL để tránh lỗi hiển thị khi không có data
    getKPIs: async (startDate, endDate, branchId, cinemaId) => {
        let query = `
        SELECT 
            COUNT(s.id) as totalShowtimes,
            -- THÊM DÒNG NÀY: Đếm số phòng duy nhất có suất chiếu
            COUNT(DISTINCT r.id) as totalRooms, 
            IFNULL(AVG(sub.soldSeats), 0) as avgTicketsPerShow,
            IFNULL(AVG(sub.revenue), 0) as avgRevenuePerShow,
            IFNULL(AVG(sub.occupancy_rate), 0) as avgOccupancyRate,
            SUM(CASE WHEN sub.occupancy_rate < 40 THEN 1 ELSE 0 END) as lowEfficiencyShows
        FROM showtimes s
        JOIN rooms r ON s.room_id = r.id
        JOIN cinemas c ON r.cinema_id = c.id
        LEFT JOIN (
            SELECT 
                st.id as showtime_id,
                COUNT(CASE WHEN ss.status = 'booked' OR ss.status = '1' THEN 1 END) as soldSeats,
                SUM(IFNULL(b.total_price, 0)) as revenue,
                (COUNT(CASE WHEN ss.status = 'booked' OR ss.status = '1' THEN 1 END) / 
                 NULLIF(IFNULL(t.capacity, rm.capacity), 0) * 100) as occupancy_rate
            FROM showtimes st
            JOIN rooms rm ON st.room_id = rm.id
            LEFT JOIN seat_templates t ON rm.template_id = t.id
            LEFT JOIN showtime_seats ss ON st.id = ss.showtime_id
            LEFT JOIN bookings b ON st.id = b.showtime_id AND b.payment_status = 'paid'
            GROUP BY st.id, t.capacity, rm.capacity
        ) sub ON s.id = sub.showtime_id
        WHERE s.show_date BETWEEN ? AND ?
    `;
        const params = [startDate, endDate];
        if (branchId && branchId !== 'all' && branchId !== '') { query += ` AND c.branch_id = ?`; params.push(branchId); }
        if (cinemaId && cinemaId !== 'all' && cinemaId !== '') { query += ` AND c.id = ?`; params.push(cinemaId); }

        const [rows] = await pool.query(query, params);
        return rows[0];
    },

    // 2. Heatmap: Giờ vs Phòng
    // 2. Heatmap: Giờ vs Phòng
    getHeatmap: async (startDate, endDate, branchId, cinemaId) => {
        let query = `
        SELECT 
            HOUR(s.start_time) as hour,
            r.name as roomName,
            -- Tính trung bình tỷ lệ lấp đầy của các suất chiếu trong khung giờ đó
            -- Sử dụng IFNULL(t.capacity, r.capacity) để tránh lấy số 0 từ bảng rooms
            CAST(AVG(
                (SELECT COUNT(*) FROM showtime_seats ss 
                 WHERE ss.showtime_id = s.id AND (ss.status = 'booked' OR ss.status = '1')) 
                / NULLIF(IFNULL(t.capacity, r.capacity), 0) * 100
            ) AS DECIMAL(10,2)) as occupancy
        FROM showtimes s
        JOIN rooms r ON s.room_id = r.id
        JOIN cinemas c ON r.cinema_id = c.id
        LEFT JOIN seat_templates t ON r.template_id = t.id
        WHERE s.show_date BETWEEN ? AND ?
    `;

        const params = [startDate, endDate];

        // Thêm các bộ lọc nếu có
        if (branchId && branchId !== 'all' && branchId !== '') {
            query += ` AND c.branch_id = ?`;
            params.push(branchId);
        }
        if (cinemaId && cinemaId !== 'all' && cinemaId !== '') {
            query += ` AND c.id = ?`;
            params.push(cinemaId);
        }

        query += ` GROUP BY hour, roomName ORDER BY hour ASC, roomName ASC`;

        try {
            const [rows] = await pool.query(query, params);

            // Trả về dữ liệu sạch cho Frontend
            return rows.map(row => ({
                hour: parseInt(row.hour),
                roomName: row.roomName,
                occupancy: parseFloat(row.occupancy || 0)
            }));
        } catch (error) {
            console.error("Error in getHeatmap:", error);
            throw error;
        }
    },
    // 3. Suất chiếu kém hiệu quả (Sửa lỗi thiếu Filter)
    // 3. Suất chiếu kém hiệu quả (Sửa công thức tính occupancy)
    getLowEfficiencyList: async (startDate, endDate, branchId, cinemaId) => {
        let query = `
            SELECT 
                m.title, 
                s.start_time, 
                s.show_date,
                r.name as roomName,
                -- Sử dụng công thức chuẩn lấy từ template
                (COUNT(CASE WHEN ss.status = 'booked' OR ss.status = '1' THEN 1 END) / 
                 NULLIF(IFNULL(t.capacity, r.capacity), 0) * 100) as occupancy
            FROM showtimes s
            JOIN movies m ON s.movie_id = m.id
            JOIN rooms r ON s.room_id = r.id
            JOIN cinemas c ON r.cinema_id = c.id
            LEFT JOIN seat_templates t ON r.template_id = t.id
            LEFT JOIN showtime_seats ss ON s.id = ss.showtime_id
            WHERE s.show_date BETWEEN ? AND ?
        `;

        const params = [startDate, endDate];
        if (branchId && branchId !== 'all' && branchId !== '') { query += ` AND c.branch_id = ?`; params.push(branchId); }
        if (cinemaId && cinemaId !== 'all' && cinemaId !== '') { query += ` AND c.id = ?`; params.push(cinemaId); }

        query += ` 
            GROUP BY s.id, m.title, s.start_time, s.show_date, r.name, t.capacity, r.capacity
            HAVING occupancy < 40 
            ORDER BY occupancy ASC 
            LIMIT 10
        `;

        const [rows] = await pool.query(query, params);
        return rows;
    },
    getOccupancyTrend: async (startDate, endDate, branchId, cinemaId) => {
        let query = `
        SELECT 
            DATE_FORMAT(s.show_date, '%d/%m') as date,
            COUNT(CASE WHEN ss.status = 'booked' OR ss.status = '1' THEN 1 END) as totalTickets,
            CAST(AVG(sub.daily_occupancy) AS DECIMAL(10,2)) as avgOccupancy
        FROM showtimes s
        JOIN rooms r ON s.room_id = r.id
        JOIN cinemas c ON r.cinema_id = c.id
        LEFT JOIN showtime_seats ss ON s.id = ss.showtime_id
        LEFT JOIN (
            SELECT 
                st.id,
                (COUNT(CASE WHEN sst.status = 'booked' OR sst.status = '1' THEN 1 END) / 
                 NULLIF(IFNULL(t.capacity, rm.capacity), 0) * 100) as daily_occupancy
            FROM showtimes st
            JOIN rooms rm ON st.room_id = rm.id
            LEFT JOIN seat_templates t ON rm.template_id = t.id
            LEFT JOIN showtime_seats sst ON st.id = sst.showtime_id
            GROUP BY st.id, t.capacity, rm.capacity
        ) sub ON s.id = sub.id
        WHERE s.show_date BETWEEN ? AND ?
    `;

        const params = [startDate, endDate];
        if (branchId && branchId !== 'all' && branchId !== '') { query += ` AND c.branch_id = ?`; params.push(branchId); }
        if (cinemaId && cinemaId !== 'all' && cinemaId !== '') { query += ` AND c.id = ?`; params.push(cinemaId); }

        query += ` GROUP BY s.show_date ORDER BY s.show_date ASC`;

        const [rows] = await pool.query(query, params);
        return rows.map(row => ({
            date: row.date,
            tickets: parseInt(row.totalTickets),
            occupancy: parseFloat(row.avgOccupancy || 0)
        }));
    },
    getOverallOccupancy: async (startDate, endDate, branchId, cinemaId) => {
        // 1. Tính tổng sức chứa (Capacity) từ danh sách các suất chiếu duy nhất
        let capacityQuery = `
        SELECT SUM(IFNULL(t.capacity, r.capacity)) as totalCapacity
        FROM showtimes s
        JOIN rooms r ON s.room_id = r.id
        JOIN cinemas c ON r.cinema_id = c.id
        LEFT JOIN seat_templates t ON r.template_id = t.id
        WHERE s.show_date BETWEEN ? AND ?
    `;

        // 2. Tính tổng vé đã bán (Sold) từ bảng ghế
        let soldQuery = `
        SELECT COUNT(*) as totalSold
        FROM showtime_seats ss
        JOIN showtimes s ON ss.showtime_id = s.id
        JOIN rooms r ON s.room_id = r.id
        JOIN cinemas c ON r.cinema_id = c.id
        WHERE s.show_date BETWEEN ? AND ?
        AND (ss.status = 'booked' OR ss.status = '1')
    `;

        const params = [startDate, endDate];
        let filter = "";
        const filterParams = [];

        if (branchId && branchId !== 'all' && branchId !== '') {
            filter += ` AND c.branch_id = ?`;
            filterParams.push(branchId);
        }
        if (cinemaId && cinemaId !== 'all' && cinemaId !== '') {
            filter += ` AND c.id = ?`;
            filterParams.push(cinemaId);
        }

        // Thực hiện cả 2 query song song để tối ưu tốc độ
        const [capRows, soldRows] = await Promise.all([
            pool.query(capacityQuery + filter, [...params, ...filterParams]),
            pool.query(soldQuery + filter, [...params, ...filterParams])
        ]);

        const total = capRows[0][0].totalCapacity || 0;
        const sold = soldRows[0][0].totalSold || 0;
        const empty = total - sold;

        return [
            { name: 'Ghế đã bán', value: sold, color: '#00C49F' },
            { name: 'Ghế trống (Lãng phí)', value: empty > 0 ? empty : 0, color: '#FF8042' }
        ];
    },
    // 4. Theo khung giờ (Sửa lỗi thiếu Filter)
    getTicketsByTimeSlot: async (startDate, endDate, branchId, cinemaId) => {
        let query = `
        SELECT 
            CASE 
                WHEN HOUR(s.start_time) BETWEEN 6 AND 11 THEN 'Sáng (6h-12h)'
                WHEN HOUR(s.start_time) BETWEEN 12 AND 17 THEN 'Chiều (12h-18h)'
                ELSE 'Tối (18h-24h)'
            END as timeSlot,
            -- CHỈ ĐẾM NHỮNG GHẾ ĐÃ ĐẶT THÀNH CÔNG (BOOKED)
            COUNT(CASE WHEN ss.status = 'booked' THEN 1 END) as tickets
        FROM showtimes s
        JOIN showtime_seats ss ON s.id = ss.showtime_id
        JOIN rooms r ON s.room_id = r.id
        JOIN cinemas c ON r.cinema_id = c.id
        WHERE s.show_date BETWEEN ? AND ?
    `;
        const params = [startDate, endDate];
        if (branchId && branchId !== 'all' && branchId !== '') { query += ` AND c.branch_id = ?`; params.push(branchId); }
        if (cinemaId && cinemaId !== 'all' && cinemaId !== '') { query += ` AND c.id = ?`; params.push(cinemaId); }

        query += ` GROUP BY timeSlot ORDER BY FIELD(timeSlot, 'Sáng (6h-12h)', 'Chiều (12h-18h)', 'Tối (18h-24h)')`;
        const [rows] = await pool.query(query, params);
        return rows;
    },
    // Thêm vào trong đối tượng ShowtimeStatisticsModel
    getTopMoviesRevenue: async (startDate, endDate, branchId, cinemaId) => {
        let query = `
        SELECT 
            m.title as movieTitle, 
            SUM(b.total_price) as totalRevenue,
            COUNT(DISTINCT s.id) as showtimeCount
        FROM movies m
        INNER JOIN showtimes s ON m.id = s.movie_id
        INNER JOIN bookings b ON s.id = b.showtime_id
        WHERE s.show_date BETWEEN ? AND ?
          AND b.payment_status = 'paid'
    `;

        const params = [startDate, endDate];

        // Bộ lọc theo Chi nhánh/Rạp (Dựa trên cấu trúc bảng showtimes có sẵn branch_id, cinema_id)
        if (branchId && branchId !== 'all' && branchId !== '') {
            query += ` AND s.branch_id = ?`;
            params.push(branchId);
        }
        if (cinemaId && cinemaId !== 'all' && cinemaId !== '') {
            query += ` AND s.cinema_id = ?`;
            params.push(cinemaId);
        }

        query += ` GROUP BY m.id, m.title ORDER BY totalRevenue DESC LIMIT 5`;

        try {
            const [rows] = await pool.query(query, params);
            return rows.map(row => ({
                name: row.movieTitle,
                value: parseFloat(row.totalRevenue || 0),
                shows: row.showtimeCount
            }));
        } catch (error) {
            console.error("Error getTopMoviesRevenue:", error);
            throw error;
        }
    },
    getRoomPerformance: async (startDate, endDate, branchId, cinemaId) => {
        let query = `
    SELECT 
        r.name as roomName,
        CAST(IFNULL(AVG(sub.occupancy), 0) AS DECIMAL(10,2)) as avgOccupancy
    FROM rooms r
    JOIN cinemas c ON r.cinema_id = c.id
    -- Kết nối trực tiếp với template của phòng để lấy sức chứa chuẩn
    LEFT JOIN seat_templates t_main ON r.template_id = t_main.id
    LEFT JOIN showtimes s ON r.id = s.room_id AND s.show_date BETWEEN ? AND ?
    LEFT JOIN (
        SELECT 
            st.id as showtime_id,
            -- SỬA TẠI ĐÂY: Ưu tiên lấy capacity từ template, nếu không có mới dùng room capacity
            (COUNT(CASE WHEN ss.status = 'booked' OR ss.status = '1' THEN 1 END) / 
             NULLIF(IFNULL(t.capacity, rm.capacity), 0) * 100) as occupancy
        FROM showtimes st
        JOIN rooms rm ON st.room_id = rm.id
        LEFT JOIN seat_templates t ON rm.template_id = t.id
        LEFT JOIN showtime_seats ss ON st.id = ss.showtime_id
        GROUP BY st.id, t.capacity, rm.capacity
    ) sub ON s.id = sub.showtime_id
    WHERE 1=1
    `;
        const params = [startDate, endDate];

        if (branchId && branchId !== 'all' && branchId !== '') {
            query += ` AND c.branch_id = ?`;
            params.push(branchId);
        }
        if (cinemaId && cinemaId !== 'all' && cinemaId !== '') {
            query += ` AND c.id = ?`;
            params.push(cinemaId);
        }

        query += ` GROUP BY r.id, r.name ORDER BY avgOccupancy DESC`;

        const [rows] = await pool.query(query, params);

        return rows.map(row => ({
            ...row,
            avgOccupancy: parseFloat(row.avgOccupancy)
        }));
    },
    // 7. Doanh thu theo định dạng (2D / 3D / IMAX)
    getRevenueByFormat: async (startDate, endDate, branchId, cinemaId) => {
        let query = `
            SELECT 
                r.room_type as formatName, 
                SUM(IFNULL(b.total_price, 0)) as revenue
            FROM showtimes s
            JOIN rooms r ON s.room_id = r.id
            JOIN cinemas c ON r.cinema_id = c.id
            -- Kết nối với bảng bookings để lấy doanh thu từ các vé đã thanh toán
            LEFT JOIN bookings b ON s.id = b.showtime_id AND b.payment_status = 'paid'
            WHERE s.show_date BETWEEN ? AND ?
        `;
        const params = [startDate, endDate];

        // Bộ lọc theo Chi nhánh
        if (branchId && branchId !== 'all' && branchId !== '') {
            query += ` AND c.branch_id = ?`;
            params.push(branchId);
        }

        // Bộ lọc theo Rạp
        if (cinemaId && cinemaId !== 'all' && cinemaId !== '') {
            query += ` AND c.id = ?`;
            params.push(cinemaId);
        }

        // Nhóm theo cột room_type (chứa 2D/3D/IMAX)
        query += ` GROUP BY r.room_type ORDER BY revenue DESC`;

        try {
            const [rows] = await pool.query(query, params);

            // Chuyển đổi kết quả: Ép kiểu revenue sang Number để Recharts hiển thị được
            return rows.map(row => ({
                formatName: row.formatName || 'Khác',
                revenue: parseFloat(row.revenue || 0)
            }));
        } catch (error) {
            console.error("Error in getRevenueByFormat:", error);
            throw error;
        }
    },
    // Metadata phục vụ bộ lọc (Cần thiết để UI hiển thị được Chi nhánh/Rạp)
    getBranches: async () => {
        const [rows] = await pool.query("SELECT id, name FROM branches ORDER BY name ASC");
        return rows;
    },

    getCinemas: async () => {
        const [rows] = await pool.query("SELECT id, name, branch_id FROM cinemas ORDER BY name ASC");
        return rows;
    }
};

module.exports = ShowtimeStatisticsModel;