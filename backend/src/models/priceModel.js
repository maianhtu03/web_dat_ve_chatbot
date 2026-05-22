const db = require('../config/db');

const Price = {
    // Lấy danh sách ID các rạp đã có cấu hình giá (Dùng để hiển thị danh sách quản lý)
    getConfiguredCinemaIds: async () => {
        // Sử dụng DISTINCT để tránh trùng lặp nếu một rạp có nhiều dòng giá
        const [rows] = await db.query('SELECT DISTINCT cinema_id FROM base_prices');
        return rows;
    },

    // Lấy giá sàn theo cinema_id
    getBasePricesByCinema: async (cinemaId) => {
        const [rows] = await db.query('SELECT * FROM base_prices WHERE cinema_id = ?', [cinemaId]);
        return rows;
    },

    // Lấy phụ thu theo cinema_id
    getSurchargesByCinema: async (cinemaId) => {
        const [rows] = await db.query('SELECT * FROM price_surcharges WHERE cinema_id = ?', [cinemaId]);
        return rows;
    },
    isHoliday: async (dateString) => {
        // dateString dạng '2026-04-30'
        const [rows] = await db.query('SELECT id FROM holidays WHERE holiday_date = ?', [dateString]);
        return rows.length > 0;
    },

    // Xóa và cập nhật lại toàn bộ bảng giá (dùng trong Service Transaction)
    updateBasePrices: async (connection, cinemaId, basePrices) => {
        for (const item of basePrices) {
            await connection.query(
                `INSERT INTO base_prices (cinema_id, day_type, time_slot, price) 
             VALUES (?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE price = VALUES(price)`,
                [cinemaId, item.day_type, item.time_slot, item.price]
            );
        }
    },

    clearAndInsertSurcharges: async (connection, cinemaId, surcharges) => {
        // 1. Xóa cũ
        await connection.query('DELETE FROM price_surcharges WHERE cinema_id = ?', [cinemaId]);

        if (surcharges && surcharges.length > 0) {
            // 2. Map dữ liệu
            const values = surcharges.map(s => [
                cinemaId,
                s.type,
                s.name,
                s.extra_fee || s.extraFee || 0
            ]);

            // 3. Insert hàng loạt
            await connection.query(
                'INSERT INTO price_surcharges (cinema_id, type, name, extra_fee) VALUES ?',
                [values]
            );
        }
    }
};

module.exports = Price;
