const pool = require('../config/db');

const FoodStatisticsModel = {
    /**
     * Hàm bổ trợ xây dựng điều kiện lọc động
     * Giúp tái sử dụng logic lọc cho tất cả các truy vấn
     */
    buildFilter: (branchId, cinemaId) => {
        let filterClause = '';
        const params = [];

        if (branchId && branchId !== 'all') {
            filterClause += ` AND cn.branch_id = ?`;
            params.push(branchId);
        }
        if (cinemaId && cinemaId !== 'all') {
            filterClause += ` AND cn.id = ?`;
            params.push(cinemaId);
        }
        return { filterClause, params };
    },

    // 1. Truy vấn lấy tổng quan (Thẻ Card)
    getSummary: async (startDate, endDate, branchId, cinemaId) => {
        const { filterClause, params } = FoodStatisticsModel.buildFilter(branchId, cinemaId);

        const query = `
            SELECT 
                SUM(ci.quantity) as totalQuantity,
                SUM(ci.quantity * COALESCE(c.sale_price, c.original_price, f.price)) as totalRevenue
            FROM combo_items ci
            JOIN bookings b ON ci.booking_id = b.id
            JOIN showtimes s ON b.showtime_id = s.id
            JOIN rooms r ON s.room_id = r.id
            JOIN cinemas cn ON r.cinema_id = cn.id
            LEFT JOIN combos c ON ci.combo_id = c.id
            LEFT JOIN foods f ON ci.food_id = f.id
            WHERE b.payment_status = 'paid' 
              AND DATE(b.created_at) BETWEEN ? AND ?
              ${filterClause}`;

        const [rows] = await pool.query(query, [startDate, endDate, ...params]);
        return rows[0] || { totalQuantity: 0, totalRevenue: 0 };
    },

    // 2. Truy vấn phân bổ theo rạp (Biểu đồ tròn)
    getDistribution: async (startDate, endDate, branchId, cinemaId) => {
        const { filterClause, params } = FoodStatisticsModel.buildFilter(branchId, cinemaId);

        const query = `
            SELECT 
                cn.name,
                SUM(ci.quantity * COALESCE(c.sale_price, c.original_price, f.price)) as value
            FROM combo_items ci
            JOIN bookings b ON ci.booking_id = b.id
            JOIN showtimes s ON b.showtime_id = s.id
            JOIN rooms r ON s.room_id = r.id
            JOIN cinemas cn ON r.cinema_id = cn.id
            LEFT JOIN combos c ON ci.combo_id = c.id
            LEFT JOIN foods f ON ci.food_id = f.id
            WHERE b.payment_status = 'paid' 
              AND DATE(b.created_at) BETWEEN ? AND ?
              ${filterClause}
            GROUP BY cn.id`;

        const [rows] = await pool.query(query, [startDate, endDate, ...params]);
        return rows;
    },

    // 3. Truy vấn top sản phẩm (Biểu đồ cột đơn)
    getTopItems: async (startDate, endDate, branchId, cinemaId) => {
        const { filterClause, params } = FoodStatisticsModel.buildFilter(branchId, cinemaId);

        const query = `
            SELECT 
                COALESCE(c.name, f.name) as name,
                SUM(ci.quantity * COALESCE(c.sale_price, c.original_price, f.price)) as revenue
            FROM combo_items ci
            JOIN bookings b ON ci.booking_id = b.id
            JOIN showtimes s ON b.showtime_id = s.id
            JOIN rooms r ON s.room_id = r.id
            JOIN cinemas cn ON r.cinema_id = cn.id
            LEFT JOIN combos c ON ci.combo_id = c.id
            LEFT JOIN foods f ON ci.food_id = f.id
            WHERE b.payment_status = 'paid' 
              AND DATE(b.created_at) BETWEEN ? AND ?
              ${filterClause}
            GROUP BY name
            ORDER BY revenue DESC
            LIMIT 5`;

        const [rows] = await pool.query(query, [startDate, endDate, ...params]);
        return rows;
    },

    // 4. Thống kê Số lượng theo rạp (Biểu đồ cột chồng - Stacked Bar)
    getQuantityByCinema: async (startDate, endDate, branchId, cinemaId) => {
        const { filterClause, params } = FoodStatisticsModel.buildFilter(branchId, cinemaId);

        const query = `
            SELECT 
                cn.name as cinemaName,
                COALESCE(c.name, f.name) as itemName,
                SUM(ci.quantity) as quantity
            FROM combo_items ci
            JOIN bookings b ON ci.booking_id = b.id
            JOIN showtimes s ON b.showtime_id = s.id
            JOIN rooms r ON s.room_id = r.id
            JOIN cinemas cn ON r.cinema_id = cn.id
            LEFT JOIN combos c ON ci.combo_id = c.id
            LEFT JOIN foods f ON ci.food_id = f.id
            WHERE b.payment_status = 'paid' 
              AND DATE(b.created_at) BETWEEN ? AND ?
              ${filterClause}
            GROUP BY cn.id, itemName`;

        const [rows] = await pool.query(query, [startDate, endDate, ...params]);

        // Logic Pivot để Recharts vẽ Stacked Bar
        return rows.reduce((acc, row) => {
            let cinema = acc.find(item => item.cinemaName === row.cinemaName);
            if (!cinema) {
                cinema = { cinemaName: row.cinemaName };
                acc.push(cinema);
            }
            cinema[row.itemName] = Number(row.quantity);
            return acc;
        }, []);
    },

    // 5. Thống kê Doanh thu chi tiết theo rạp (Biểu đồ cột chồng - Stacked Bar)
    getRevenueDetailByCinema: async (startDate, endDate, branchId, cinemaId) => {
        const { filterClause, params } = FoodStatisticsModel.buildFilter(branchId, cinemaId);

        const query = `
            SELECT 
                cn.name as cinemaName,
                COALESCE(c.name, f.name) as itemName,
                SUM(ci.quantity * COALESCE(c.sale_price, c.original_price, f.price)) as revenue
            FROM combo_items ci
            JOIN bookings b ON ci.booking_id = b.id
            JOIN showtimes s ON b.showtime_id = s.id
            JOIN rooms r ON s.room_id = r.id
            JOIN cinemas cn ON r.cinema_id = cn.id
            LEFT JOIN combos c ON ci.combo_id = c.id
            LEFT JOIN foods f ON ci.food_id = f.id
            WHERE b.payment_status = 'paid' 
              AND DATE(b.created_at) BETWEEN ? AND ?
              ${filterClause}
            GROUP BY cn.id, itemName`;

        const [rows] = await pool.query(query, [startDate, endDate, ...params]);

        return rows.reduce((acc, row) => {
            let cinema = acc.find(item => item.cinemaName === row.cinemaName);
            if (!cinema) {
                cinema = { cinemaName: row.cinemaName };
                acc.push(cinema);
            }
            cinema[row.itemName] = Number(row.revenue);
            return acc;
        }, []);
    },
    // FoodStatisticsModel.js
    getRevenueTrend: async (startDate, endDate, branchId, cinemaId) => {
        const { filterClause, params } = FoodStatisticsModel.buildFilter(branchId, cinemaId);

        const query = `
            SELECT 
                DATE(b.created_at) as date,
                SUM(ci.quantity * COALESCE(c.sale_price, c.original_price, f.price)) as revenue
            FROM combo_items ci
            JOIN bookings b ON ci.booking_id = b.id
            JOIN showtimes s ON b.showtime_id = s.id
            JOIN rooms r ON s.room_id = r.id
            JOIN cinemas cn ON r.cinema_id = cn.id
            LEFT JOIN combos c ON ci.combo_id = c.id
            LEFT JOIN foods f ON ci.food_id = f.id
            WHERE b.payment_status = 'paid' 
              AND DATE(b.created_at) BETWEEN ? AND ?
              ${filterClause}
            GROUP BY DATE(b.created_at)
            ORDER BY DATE(b.created_at) ASC
        `;

        try {
            // Thứ tự params: startDate, endDate, sau đó mới đến branchId/cinemaId từ buildFilter
            const [rows] = await pool.query(query, [startDate, endDate, ...params]);
            return rows;
        } catch (error) {
            console.error("Error in getRevenueTrend model:", error);
            throw error;
        }
    },
    getBranches: async () => {
        try {
            // Dựa trên ảnh image_7c0fef.png, bảng branches có id và name
            const [rows] = await pool.query(
                "SELECT id, name FROM branches WHERE is_active = 1 ORDER BY name ASC"
            );
            return rows;
        } catch (error) {
            console.error("Error in getBranches (Food):", error);
            throw error;
        }
    },

    // 7. Metadata: Lấy danh sách rạp phục vụ bộ lọc
    getCinemas: async () => {
        try {
            // Dựa trên ảnh image_7c1014.png, bảng cinemas có id, name và branch_id
            const [rows] = await pool.query(
                "SELECT id, name, branch_id FROM cinemas WHERE is_active = 1 ORDER BY name ASC"
            );
            return rows;
        } catch (error) {
            console.error("Error in getCinemas (Food):", error);
            throw error;
        }
    }
}; // Kết


module.exports = FoodStatisticsModel;