const db = require('../config/db');

// 1. Lấy tất cả danh mục quyền (Để hiện lên các Checkbox ở Frontend)
const getAllPermissions = async (req, res) => {
    try {
        const [permissions] = await db.execute('SELECT * FROM permissions');
        return res.status(200).json(permissions);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi lấy danh mục quyền!", error });
    }
};

// 2. Gán quyền cho một User (Admin tích chọn rồi lưu)
const assignPermissions = async (req, res) => {
    const { userId, permissionIds } = req.body; // permissionIds là mảng [1, 2, 5...]

    try {
        // Xóa các quyền cũ của user này trước khi gán mới (để tránh trùng lặp)
        await db.execute('DELETE FROM user_permissions WHERE user_id = ?', [userId]);

        // Nếu có danh sách quyền mới thì chèn vào
        if (permissionIds && permissionIds.length > 0) {
            const values = permissionIds.map(pId => [userId, pId]);
            // Dùng query thay vì execute cho insert nhiều dòng
            await db.query('INSERT INTO user_permissions (user_id, permission_id) VALUES ?', [values]);
        }

        return res.status(200).json({ message: "Cập nhật phân quyền thành công!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi khi phân quyền!", error });
    }
};

// 3. Lấy danh sách nhân viên (Những người có role là 'admin' nhưng không phải sếp tổng)
const getStaffList = async (req, res) => {
    try {
        const [staffs] = await db.execute('SELECT id, fullName, email, role FROM users WHERE role = "admin"');
        return res.status(200).json(staffs);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi lấy danh sách nhân viên!" });
    }
};

module.exports = { getAllPermissions, assignPermissions, getStaffList };