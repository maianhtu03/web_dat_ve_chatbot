const db = require('../config/db');

const Staff = {
    // 1. Lấy danh sách nhân viên
    // Sửa 'theater' thành 'cinema_id' theo image_571ce8.png
    findAll: async () => {
        const sql = `
            SELECT 
                u.id, 
                u.fullName, 
                u.email, 
                u.phone, 
                u.role, 
                u.cinema_id, 
                u.is_active,
                c.name AS cinemaName
            FROM users u
            LEFT JOIN cinemas c ON u.cinema_id = c.id
            WHERE u.role IN ('staff', 'admin')
        `;
        return db.execute(sql);
    },

    // 2. Tạo tài khoản nhân viên
    // Sửa 'theater' thành 'cinema_id' để khớp với database
    create: async (staffData) => {
        const { fullName, email, phone, password, cinema_id } = staffData;

        // Sửa query: Thêm cột birthday và gán một giá trị mặc định (VD: '2000-01-01')
        // Vì Database yêu cầu Field 'birthday' doesn't have a default value
        const sql = `INSERT INTO users (fullName, email, phone, password, cinema_id, role, is_active, birthday) 
                     VALUES (?, ?, ?, ?, ?, 'staff', 1, '2000-01-01')`;

        return db.execute(sql, [fullName, email, phone, password, cinema_id]);
    },

    // 3. Xóa nhân viên
    delete: async (id) => {
        return db.execute('DELETE FROM users WHERE id = ?', [id]);
    },

    // 4. Gán quyền cho nhân viên
    // Sửa lại logic chèn nhiều dòng (bulk insert) để tương thích với mysql2.execute
    assignPermissions: async (userId, permissionIds) => {
        // Xóa quyền cũ
        await db.execute('DELETE FROM user_permissions WHERE user_id = ?', [userId]);

        if (permissionIds && permissionIds.length > 0) {
            // Tạo chuỗi (?, ?), (?, ?) tương ứng với số lượng quyền
            const placeholders = permissionIds.map(() => '(?, ?)').join(', ');
            const sql = `INSERT INTO user_permissions (user_id, permission_id) VALUES ${placeholders}`;

            // Trải phẳng mảng ID: [uId, pId1, uId, pId2...]
            const flattenedValues = [];
            permissionIds.forEach(pId => {
                flattenedValues.push(userId, pId);
            });

            return db.execute(sql, flattenedValues);
        }
    },
    // Thêm vào trong đối tượng Staff = { ... }
    getPermissionsByUserId: async (userId) => {
        // Truy vấn bảng trung gian user_permissions để lấy các id quyền của user
        const sql = `SELECT permission_id FROM user_permissions WHERE user_id = ?`;
        return db.execute(sql, [userId]);
    },

    // 5. Lấy danh sách quyền (Sửa theo image_571c6b.png)
    getAvailablePermissions: async () => {
        return db.execute('SELECT id, permission_code, permission_name FROM permissions');
    },

    // 6. Bổ sung hàm lấy danh sách rạp (Cần thiết cho dropdown ở Frontend)
    getTheaters: async () => {
        return db.execute('SELECT id, name FROM cinemas'); // Tên bảng dựa trên tab 'cinemas' trong image_571ce8.png
    }
};

module.exports = Staff;