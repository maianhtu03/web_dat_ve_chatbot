const db = require('../config/db');

const revenueModel = {
    getRevenueReport: async (startDate, endDate, branchId, cinemaId) => {
        // --- CHUẨN HÓA THAM SỐ ---
        // Đảm bảo nếu là 'all' hoặc rỗng thì về null để dùng cho logic (? IS NULL)
        const bId = branchId === 'all' || !branchId ? null : branchId;
        const cId = cinemaId === 'all' || !cinemaId ? null : cinemaId;

        // Mảng params cố định cho mọi Query, không cần push() thủ công nữa
        const params = [startDate, endDate, bId, bId, cId, cId];

        // Câu lệnh lọc dùng chung cho các bảng có JOIN showtimes (st)
        const filterSql = `
            AND (? IS NULL OR st.branch_id = ?) 
            AND (? IS NULL OR st.cinema_id = ?)`;

        // 1. Tổng doanh thu & Tổng đơn hàng
        const totalQuery = `
            SELECT 
                IFNULL(SUM(b.total_price), 0) as totalRevenue,
                COUNT(b.id) as totalOrders
            FROM bookings b
            JOIN showtimes st ON b.showtime_id = st.id
            WHERE b.payment_status = 'paid' 
            AND DATE(b.created_at) BETWEEN ? AND ?
            ${filterSql}`;

        // 2. Doanh thu theo rạp (Dùng LEFT JOIN để hiện cả rạp doanh thu bằng 0)
        const byCinemaQuery = `
            SELECT 
                c.name, 
                IFNULL(SUM(b.total_price), 0) as value
            FROM cinemas c
            LEFT JOIN showtimes st ON c.id = st.cinema_id
            LEFT JOIN bookings b ON st.id = b.showtime_id 
                AND b.payment_status = 'paid' 
                AND DATE(b.created_at) BETWEEN ? AND ?
            WHERE (? IS NULL OR c.branch_id = ?)
            AND (? IS NULL OR c.id = ?)
            GROUP BY c.id, c.name
            ORDER BY value DESC`;

        // 3. Doanh thu theo Phim
        const byMovieQuery = `
            SELECT 
                m.title as name, 
                IFNULL(SUM(b.total_price), 0) as value
            FROM movies m
            LEFT JOIN showtimes st ON m.id = st.movie_id
            LEFT JOIN bookings b ON st.id = b.showtime_id 
                AND b.payment_status = 'paid' 
                AND DATE(b.created_at) BETWEEN ? AND ?
            WHERE 1=1 ${filterSql}
            GROUP BY m.id, m.title
            ORDER BY value DESC`;

        // 4. Phương thức thanh toán
        const byPaymentQuery = `
            SELECT 
                CASE 
                    WHEN UPPER(b.payment_method) LIKE '%VNPAY%' THEN 'VNPAY'
                    WHEN UPPER(b.payment_method) LIKE '%MOMO%' THEN 'Momo'
                    ELSE 'Khác' 
                END as name,
                COUNT(b.id) as count, 
                IFNULL(SUM(b.total_price), 0) as value
            FROM bookings b
            JOIN showtimes st ON b.showtime_id = st.id
            WHERE b.payment_status = 'paid' 
            AND DATE(b.created_at) BETWEEN ? AND ?
            ${filterSql}
            GROUP BY name`;

        // 5. Xu hướng doanh thu
        const trendQuery = `
            SELECT DATE_FORMAT(b.created_at, '%d/%m') as date, SUM(b.total_price) as revenue
            FROM bookings b
            JOIN showtimes st ON b.showtime_id = st.id
            WHERE b.payment_status = 'paid' 
            AND DATE(b.created_at) BETWEEN ? AND ?
            ${filterSql}
            GROUP BY DATE(b.created_at), date 
            ORDER BY DATE(b.created_at) ASC`;
        // --- 6. BỔ SUNG: DOANH THU THEO CHI NHÁNH ---
        const byBranchQuery = `
            SELECT 
                br.name, 
                IFNULL(SUM(b.total_price), 0) as value
            FROM branches br
            LEFT JOIN showtimes st ON br.id = st.branch_id
            LEFT JOIN bookings b ON st.id = b.showtime_id 
                AND b.payment_status = 'paid' 
                AND DATE(b.created_at) BETWEEN ? AND ?
            WHERE (? IS NULL OR br.id = ?)
            AND (? IS NULL OR st.cinema_id = ? OR st.cinema_id IS NULL)
            GROUP BY br.id, br.name
            ORDER BY value DESC`;

        try {
            // Thực thi đồng thời với mảng params đồng nhất
            const [total, byCinema, byMovie, byPayment, trend, byBranch] = await Promise.all([
                db.query(totalQuery, params),
                db.query(byCinemaQuery, params),
                db.query(byMovieQuery, params),
                db.query(byPaymentQuery, params),
                db.query(trendQuery, params),
                db.query(byBranchQuery, params)
            ]);

            return {
                totalRevenue: total[0][0]?.totalRevenue || 0,
                totalOrders: total[0][0]?.totalOrders || 0,
                byCinema: byCinema[0],
                byMovie: byMovie[0],
                byPayment: byPayment[0],
                dailyTrend: trend[0],
                byBranch: byBranch[0]
            };
        } catch (error) {
            console.error("Database Query Error:", error);
            throw error;
        }
    },
    getAllBranches: async () => {
        try {
            // Chỉnh sửa tên bảng 'branches' cho đúng với database của Tú
            const [rows] = await db.query('SELECT id, name FROM branches');
            return rows;
        } catch (error) {
            console.error("Error in getAllBranches:", error);
            throw error;
        }
    },

    // --- BỔ SUNG HÀM LẤY RẠP THEO CHI NHÁNH ---
    getCinemasByBranch: async (branchId) => {
        try {
            // Nếu không có branchId thì lấy tất cả, nếu có thì lọc theo branch_id
            let sql = 'SELECT id, name FROM cinemas';
            let params = [];

            if (branchId && branchId !== 'all') {
                sql += ' WHERE branch_id = ?';
                params.push(branchId);
            }

            const [rows] = await db.query(sql, params);
            return rows;
        } catch (error) {
            console.error("Error in getCinemasByBranch:", error);
            throw error;
        }
    }
};

module.exports = revenueModel;