const db = require('../config/db');

const Room = {
    // Lấy danh sách kèm JOIN để có tên Rạp và Chi nhánh
    findAll: async () => {
        const sql = `
        SELECT 
            r.*, 
            c.name as cinema_name, 
            c.is_active as cinema_active, -- Thêm để biết rạp còn mở không
            b.name as branch_name, 
            b.id as branch_id,
            b.is_active as branch_active, -- Thêm để biết chi nhánh còn mở không
            IFNULL(t.capacity, r.capacity) as actual_capacity
        FROM rooms r
        JOIN cinemas c ON r.cinema_id = c.id
        JOIN branches b ON c.branch_id = b.id
        LEFT JOIN seat_templates t ON r.template_id = t.id
        ORDER BY r.id DESC
    `;
        const [rows] = await db.execute(sql);
        return rows;
    },
    findCinemasByBranch: async (branchId) => {
        const sql = `
        SELECT id, name 
        FROM cinemas 
        WHERE branch_id = ? AND is_active = 1 -- Thêm điều kiện này để lọc rạp đã tắt
    `;
        const [rows] = await db.execute(sql, [branchId]);
        return rows;
    },
    // 3. MỚI: Lấy Phòng theo Rạp (Giải quyết lỗi hiển thị của bạn)
    findByCinema: async (cinemaId) => {
        const sql = `SELECT id, name FROM rooms WHERE cinema_id = ? AND is_active = 1`;
        const [rows] = await db.execute(sql, [cinemaId]);
        return rows;
    },


    // Kiểm tra hàm create trong roomModel.js
    create: async (data) => {
        const { cinema_id, name, room_type, capacity, is_active, status, template_id } = data;

        // Đếm: 1, 2, 3, 4, 5, 6, 7 cột
        const sql = `
        INSERT INTO rooms (cinema_id, name, room_type, capacity, is_active, status, template_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

        // Đếm: 1, 2, 3, 4, 5, 6, 7 giá trị
        const [result] = await db.execute(sql, [
            cinema_id,
            name,
            room_type,
            capacity || 0,
            is_active ?? 1,
            status ?? 'Đã xuất bản',
            template_id || null
        ]);
        return result.insertId;
    },
    update: async (id, data) => {
        const { cinema_id, name, room_type, capacity, is_active, status, template_id } = data;
        const sql = `
        UPDATE rooms 
        SET cinema_id = ?, name = ?, room_type = ?, capacity = ?, is_active = ?, status = ?, template_id = ? 
        WHERE id = ?
    `;
        // THỨ TỰ TRUYỀN VÀO PHẢI KHỚP VỚI DẤU ?
        const [result] = await db.execute(sql, [
            cinema_id,
            name,
            room_type,
            capacity,
            is_active ?? 1,
            status,
            template_id || null, // Đây là tham số thứ 7
            id                   // Đây là tham số thứ 8 cho WHERE id = ?
        ]);
        return result.affectedRows;
    },
    findById: async (id) => {
        const sql = `
            SELECT 
                r.*, 
                t.cols_count, 
                t.rows_count,
                t.capacity as template_capacity,
                c.name as cinema_name
            FROM rooms r
            LEFT JOIN seat_templates t ON r.template_id = t.id
            LEFT JOIN cinemas c ON r.cinema_id = c.id
            WHERE r.id = ?
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    updateStatus: async (id, is_active) => {
        const sql = "UPDATE rooms SET is_active = ? WHERE id = ?";
        const [result] = await db.execute(sql, [is_active, id]);
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.execute("DELETE FROM rooms WHERE id = ?", [id]);
        return result.affectedRows;
    }

};

module.exports = Room;