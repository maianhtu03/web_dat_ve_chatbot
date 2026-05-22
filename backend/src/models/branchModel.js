const db = require('../config/db'); // Kết nối mysql2/promise

const Branch = {
    // Lấy tất cả chi nhánh
    findAll: async () => {
        const [rows] = await db.execute("SELECT * FROM branches ORDER BY id DESC");
        return rows;
    },
    // 2. THÊM HÀM MỚI NÀY: Dùng riêng cho các thanh chọn (Dropdown) ở phần Phòng/Rạp
    findActive: async () => {
        const sql = "SELECT id, name FROM branches WHERE is_active = 1 ORDER BY name ASC";
        const [rows] = await db.execute(sql);
        return rows;
    },

    // Tìm theo ID
    findById: async (id) => {
        const [rows] = await db.execute("SELECT * FROM branches WHERE id = ?", [id]);
        return rows[0];
    },

    // Thêm mới
    create: async (name) => {
        const [result] = await db.execute(
            "INSERT INTO branches (name, is_active) VALUES (?, 1)",
            [name]
        );
        return result.insertId;
    },

    // Cập nhật trạng thái hoạt động
    updateStatus: async (id, is_active) => {
        const [result] = await db.execute(
            "UPDATE branches SET is_active = ? WHERE id = ?",
            [is_active, id]
        );
        return result.affectedRows;
    },
    update: async (id, name) => {
        const [result] = await db.execute(
            "UPDATE branches SET name = ? WHERE id = ?",
            [name, id]
        );
        return result.affectedRows;
    },

    // Xóa chi nhánh
    delete: async (id) => {
        const [result] = await db.execute("DELETE FROM branches WHERE id = ?", [id]);
        return result.affectedRows;
    },
    getRawBranchTree: async () => {
        const sql = `
            SELECT 
                b.id AS branch_id, 
                b.name AS branch_name,
                c.id AS cinema_id, 
                c.name AS cinema_name
            FROM branches b
            LEFT JOIN cinemas c ON b.id = c.branch_id
            WHERE b.is_active = 1 
            AND (c.is_active = 1 OR c.is_active IS NULL)
            ORDER BY b.id ASC, c.id ASC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    }
};

module.exports = Branch;