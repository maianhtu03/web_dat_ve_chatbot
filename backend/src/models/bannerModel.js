const db = require('../config/db');

const Banner = {
    // Lấy danh sách banner (sắp xếp theo độ ưu tiên)
    getAll: async () => {
        const [rows] = await db.query("SELECT * FROM banners ORDER BY order_priority ASC, created_at DESC");
        return rows;
    },

    // Lấy chi tiết 1 banner
    getById: async (id) => {
        const [rows] = await db.query("SELECT * FROM banners WHERE id = ?", [id]);
        return rows[0];
    },

    // Thêm nhiều banner cùng lúc (Bulk Insert)
    createBulk: async (values) => {
        // values là mảng các mảng: [[title, url, type, target, ext, status, priority], [...]]
        const sql = `INSERT INTO banners 
            (title, image_url, link_type, target_id, external_url, status, order_priority) 
            VALUES ?`;
        const [result] = await db.query(sql, [values]);
        return result;
    },

    // Cập nhật banner
    update: async (id, data) => {
        const { title, image_url, link_type, target_id, external_url, status, order_priority } = data;
        const sql = `UPDATE banners SET 
            title = ?, image_url = ?, link_type = ?, target_id = ?, 
            external_url = ?, status = ?, order_priority = ? 
            WHERE id = ?`;
        const [result] = await db.query(sql, [
            title, image_url, link_type, target_id, external_url, status, order_priority, id
        ]);
        return result;
    },

    // Xóa banner
    delete: async (id) => {
        const [result] = await db.query("DELETE FROM banners WHERE id = ?", [id]);
        return result;
    }
};

module.exports = Banner;