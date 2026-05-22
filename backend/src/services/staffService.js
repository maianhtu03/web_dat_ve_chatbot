const Staff = require('../models/staffModel');
const bcrypt = require('bcrypt');

const staffService = {
    // 1. Lấy danh sách nhân viên
    getAllStaffs: async () => {
        const [rows] = await Staff.findAll();
        return rows;
    },

    // 2. Đăng ký nhân viên mới
    registerStaff: async (data) => {
        // --- SỬA LỖI TẠI ĐÂY ---
        // Đổi bcrypt.getSalt thành bcrypt.genSalt
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);

        /**
         * Lưu ý: Đảm bảo object 'data' truyền từ Controller vào 
         * đã chứa 'cinema_id' thay vì 'theater'.
         */
        return Staff.create(data);
    },

    // 3. Xóa nhân viên
    removeStaff: async (id) => {
        return Staff.delete(id);
    },

    // 4. Cập nhật quyền hạn
    updatePermissions: async (userId, permissionIds) => {
        // Ép kiểu userId về số nguyên nếu cần để tránh lỗi logic
        return Staff.assignPermissions(Number(userId), permissionIds);
    },
    getPermissionsByUser: async (userId) => {
        const [rows] = await Staff.getPermissionsByUserId(userId);
        return rows;
    },

    // 5. Lấy danh sách tất cả các quyền để hiển thị lên Form
    listAllPermissions: async () => {
        const [rows] = await Staff.getAvailablePermissions();
        return rows;
    },

    // 6. BỔ SUNG: Lấy danh sách rạp (Dùng cho dropdown ở Frontend)
    listAllTheaters: async () => {
        const [rows] = await Staff.getTheaters();
        return rows;
    }
};

module.exports = staffService;