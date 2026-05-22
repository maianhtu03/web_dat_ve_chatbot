const db = require('../config/db'); // Đảm bảo file này dùng mysql2/promise

const Food = {
    // Lấy tất cả đồ ăn
    getAll: async () => {
        const [rows] = await db.query("SELECT * FROM foods ORDER BY id DESC");
        return rows;
    },

    // Lấy chi tiết 1 món ăn
    getById: async (id) => {
        const [rows] = await db.query("SELECT * FROM foods WHERE id = ?", [id]);
        return rows;
    },

    // Thêm món ăn mới
    create: async (data) => {
        const { name, type, price, image, status } = data;
        const [result] = await db.query(
            "INSERT INTO foods (name, type, price, image, status) VALUES (?, ?, ?, ?, ?)",
            [name, type || 'Đồ uống', price || 0, image || null, status || 'active']
        );
        return result;
    },

    // Cập nhật thông tin món ăn
    update: async (id, data) => {
        const { name, type, price, image, status } = data;
        const [result] = await db.query(
            "UPDATE foods SET name = ?, type = ?, price = ?, image = ?, status = ? WHERE id = ?",
            [name, type, price, image, status, id]
        );
        return result;
    },

    // Xóa món ăn
    delete: async (id) => {
        const [result] = await db.query("DELETE FROM foods WHERE id = ?", [id]);
        return result;
    }
};

module.exports = Food;