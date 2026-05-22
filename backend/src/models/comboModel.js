const db = require('../config/db');

const Combo = {
    // 1. Lấy danh sách kèm theo thông tin các món ăn lẻ bên trong
    getAll: async () => {
        const query = `
            SELECT c.*, 
            JSON_ARRAYAGG(
                JSON_OBJECT('id', f.id, 'name', f.name, 'quantity', ci.quantity)
            ) as foods
            FROM combos c
            LEFT JOIN combo_items ci ON c.id = ci.combo_id
            LEFT JOIN foods f ON ci.food_id = f.id
            GROUP BY c.id ORDER BY c.id DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    // 2. Tạo combo mới
    create: async (data) => {
        const { name, original_price, sale_price, description, image } = data;
        const [result] = await db.query(
            "INSERT INTO combos (name, original_price, sale_price, description, image) VALUES (?, ?, ?, ?, ?)",
            [name, original_price, sale_price, description, image]
        );
        return result.insertId;
    },

    // 3. Thêm món lẻ vào combo
    addItems: async (comboId, foodId, quantity) => {
        return await db.query(
            "INSERT INTO combo_items (combo_id, food_id, quantity) VALUES (?, ?, ?)",
            [comboId, foodId, quantity]
        );
    },

    // 4. Cập nhật thông tin chính của combo
    update: async (id, data) => {
        const { name, original_price, sale_price, description, image } = data;

        // Nếu không có ảnh mới, chúng ta không cập nhật cột image (giữ nguyên ảnh cũ)
        let query = "UPDATE combos SET name = ?, original_price = ?, sale_price = ?, description = ? WHERE id = ?";
        let params = [name, original_price, sale_price, description, id];

        if (image) {
            query = "UPDATE combos SET name = ?, original_price = ?, sale_price = ?, description = ?, image = ? WHERE id = ?";
            params = [name, original_price, sale_price, description, image, id];
        }

        const [result] = await db.query(query, params);
        return result;
    },

    // 5. Xóa toàn bộ món lẻ thuộc một combo (dùng khi Sửa hoặc Xóa combo)
    deleteItems: async (comboId) => {
        return await db.query("DELETE FROM combo_items WHERE combo_id = ?", [comboId]);
    },

    // 6. Xóa combo chính
    delete: async (id) => {
        return await db.query("DELETE FROM combos WHERE id = ?", [id]);
    }
};

module.exports = Combo;