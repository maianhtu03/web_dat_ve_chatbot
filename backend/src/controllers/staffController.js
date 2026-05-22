const staffService = require('../services/staffService');

const staffController = {
    // 1. Lấy danh sách nhân viên
    getStaffs: async (req, res) => {
        try {
            const staffs = await staffService.getAllStaffs();
            res.json(staffs);
        } catch (error) {
            console.error("Error in getStaffs:", error);
            res.status(500).json({ message: "Lỗi lấy danh sách nhân viên", error: error.message });
        }
    },

    // 2. Thêm nhân viên mới
    addStaff: async (req, res) => {
        try {
            // Log để kiểm tra dữ liệu từ FE gửi lên có đúng 'cinema_id' chưa
            console.log("Data từ FE:", req.body);

            await staffService.registerStaff(req.body);
            res.status(201).json({ message: "Tạo nhân viên thành công" });
        } catch (error) {
            console.error("Error in addStaff:", error);
            res.status(400).json({ message: "Lỗi tạo tài khoản", error: error.message });
        }
    },

    // 3. Xóa nhân viên
    deleteStaff: async (req, res) => {
        try {
            await staffService.removeStaff(req.params.id);
            res.json({ message: "Đã xóa nhân viên thành công" });
        } catch (error) {
            console.error("Error in deleteStaff:", error);
            res.status(500).json({ message: "Lỗi khi xóa nhân viên", error: error.message });
        }
    },

    // 4. Lấy danh sách toàn bộ quyền hiện có
    getPermissions: async (req, res) => {
        try {
            const perms = await staffService.listAllPermissions();
            res.json(perms);
        } catch (error) {
            console.error("Error in getPermissions:", error);
            res.status(500).json({ message: "Lỗi lấy danh sách quyền", error: error.message });
        }
    },
    // Thêm hàm lấy quyền của 1 nhân viên cụ thể
    getStaffPermissions: async (req, res) => {
        try {
            const { id } = req.params;
            // Gọi service
            const permissions = await staffService.getPermissionsByUser(id);
            res.json(permissions);
        } catch (error) {
            // Đây chính là nơi trả về lỗi 500 bạn thấy trong ảnh
            res.status(500).json({
                message: "Lỗi lấy quyền nhân viên",
                error: error.message
            });
        }
    },

    // 5. Gán quyền cho nhân viên
    setPermissions: async (req, res) => {
        try {
            const { userId, permissionIds } = req.body;
            if (!userId) {
                return res.status(400).json({ message: "Thiếu ID nhân viên" });
            }
            await staffService.updatePermissions(userId, permissionIds);
            res.json({ message: "Cập nhật quyền thành công" });
        } catch (error) {
            console.error("Error in setPermissions:", error);
            res.status(500).json({ message: "Lỗi cập nhật quyền", error: error.message });
        }
    },

    // 6. BỔ SUNG: Lấy danh sách rạp để Frontend hiển thị trong Select box
    getTheaters: async (req, res) => {
        try {
            const theaters = await staffService.listAllTheaters();
            res.json(theaters);
        } catch (error) {
            console.error("Error in getTheaters:", error);
            res.status(500).json({ message: "Lỗi lấy danh sách rạp", error: error.message });
        }
    }
};

module.exports = staffController;