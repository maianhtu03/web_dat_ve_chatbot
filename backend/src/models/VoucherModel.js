const db = require('../config/db');

const VoucherModel = {
    // 1. Lấy tất cả voucher cho Admin
    findAll: async () => {
        const [rows] = await db.execute('SELECT * FROM vouchers ORDER BY created_at DESC');
        return rows;
    },

    // 2. TÌM THEO ID (BỔ SUNG - PHẢI CÓ ĐỂ SỬA LỖI 500)
    findById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM vouchers WHERE id = ?', [id]);
        return rows[0]; // Trả về đối tượng voucher đầu tiên tìm thấy
    },

    // 3. Tìm voucher theo mã (để kiểm tra trùng lặp)
    findByCode: async (code) => {
        const [rows] = await db.execute('SELECT * FROM vouchers WHERE voucher_code = ?', [code]);
        return rows[0];
    },

    // 4. Tạo voucher mới
    create: async (data) => {
        const sql = `
            INSERT INTO vouchers 
            (voucher_code, title, description, discount_type, discount_value, max_discount_amount, 
             min_order_value, usage_limit,limit_per_user, start_date, expiry_date, is_global, target_rank) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const params = [
            data.voucher_code, data.title, data.description, data.discount_type, data.discount_value,
            data.max_discount_amount || null, data.min_order_value || 0,
            data.usage_limit || 1, data.limit_per_user || 1, data.start_date, data.expiry_date,
            data.is_global !== undefined ? data.is_global : 1,
            data.target_rank || 'All'
        ];

        const [result] = await db.execute(sql, params);
        return result.insertId;
    },

    // 5. CẬP NHẬT Voucher
    update: async (id, data) => {
        const sql = `
            UPDATE vouchers SET 
            voucher_code = ?, title = ?, description = ?, discount_type = ?, discount_value = ?, 
            max_discount_amount = ?, min_order_value = ?, usage_limit = ?,
            limit_per_user = ?,
            start_date = ?, expiry_date = ?, is_global = ?, target_rank = ?
            WHERE id = ?`;

        const params = [
            data.voucher_code, data.title, data.description, data.discount_type, data.discount_value,
            data.max_discount_amount || null, data.min_order_value || 0,
            data.usage_limit || 1, data.limit_per_user || 1, data.start_date, data.expiry_date,
            data.is_global !== undefined ? data.is_global : 1,
            data.target_rank || 'All',
            id
        ];

        const [result] = await db.execute(sql, params);
        return result.affectedRows > 0;
    },

    // 6. Xóa voucher
    delete: async (id) => {
        return await db.execute('DELETE FROM vouchers WHERE id = ?', [id]);
    }
};

module.exports = VoucherModel;