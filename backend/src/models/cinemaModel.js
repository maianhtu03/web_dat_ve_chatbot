const db = require('../config/db');

const Cinema = {
    // Lấy rạp theo chi nhánh
    findActiveByBranch: async (branchId) => {
        const sql = `
            SELECT id, name 
            FROM cinemas 
            WHERE branch_id = ? AND is_active = 1 
            ORDER BY name ASC
        `;
        const [rows] = await db.execute(sql, [branchId]);
        return rows;
    },

    // Lấy tất cả rạp kèm thông tin chi nhánh
    findAll: async () => {
        const sql = `
            SELECT cinemas.*, branches.name as branch_name, branches.is_active as branch_active
            FROM cinemas 
            JOIN branches ON cinemas.branch_id = branches.id 
            ORDER BY cinemas.id DESC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    },

    // Tìm rạp theo ID
    findById: async (id) => {
        const [rows] = await db.execute("SELECT * FROM cinemas WHERE id = ?", [id]);
        return rows[0];
    },

    // --- CẬP NHẬT: Thêm image_url, map_iframe, hotline ---
    create: async (data) => {
        const { branch_id, name, address, description, is_active, image_url, map_iframe, hotline } = data;
        const sql = `
            INSERT INTO cinemas (branch_id, name, address, description, is_active, image_url, map_iframe, hotline) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            branch_id,
            name,
            address,
            description,
            is_active || 1,
            image_url || null,
            map_iframe || null,
            hotline || null
        ]);
        return result.insertId;
    },

    // --- CẬP NHẬT: Thêm các cột mới vào SQL Update ---
    update: async (id, data) => {
        const { branch_id, name, address, description, is_active, image_url, map_iframe, hotline } = data;

        const sql = `
            UPDATE cinemas 
            SET branch_id = ?, name = ?, address = ?, description = ?, is_active = ?, 
                image_url = ?, map_iframe = ?, hotline = ?
            WHERE id = ?
        `;

        const [result] = await db.execute(sql, [
            branch_id,
            name,
            address,
            description,
            is_active,
            image_url,
            map_iframe,
            hotline,
            id
        ]);
        return result.affectedRows;
    },

    // Cập nhật trạng thái
    updateStatus: async (id, is_active) => {
        const sql = "UPDATE cinemas SET is_active = ? WHERE id = ?";
        const [result] = await db.execute(sql, [is_active, id]);
        return result.affectedRows;
    },

    // Xóa rạp
    delete: async (id) => {
        const [result] = await db.execute("DELETE FROM cinemas WHERE id = ?", [id]);
        return result.affectedRows;
    }
};

module.exports = Cinema;