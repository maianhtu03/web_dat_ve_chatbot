const customerService = require('../services/customerService');

const customerController = {
    // 1. Lấy danh sách khách hàng
    getAllCustomers: async (req, res) => {
        try {
            const { search } = req.query;
            const customers = await customerService.fetchCustomers(search);
            res.status(200).json({ success: true, data: customers });
        } catch (error) {
            console.error("Lỗi GetAllCustomers:", error.message);
            res.status(500).json({ success: false, message: "Không thể lấy danh sách khách hàng" });
        }
    },

    // 2. Cập nhật trạng thái (Bật/Tắt)
    updateStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { is_active } = req.body;

            // Kiểm tra nếu is_active không được gửi lên
            if (is_active === undefined) {
                return res.status(400).json({ success: false, message: "Thiếu trạng thái hiện tại" });
            }

            // Gọi service xử lý đảo trạng thái
            await customerService.toggleStatus(id, is_active);

            res.status(200).json({ success: true, message: "Cập nhật trạng thái thành công" });
        } catch (error) {
            console.error("Lỗi UpdateStatus:", error.message);
            res.status(500).json({ success: false, message: "Lỗi hệ thống khi cập nhật trạng thái" });
        }
    },

    // 3. Cập nhật thông tin Hội viên (Hạng & Điểm)
    updateInfo: async (req, res) => {
        try {
            const { id } = req.params;
            const { rank_name, current_points } = req.body;

            // Kiểm tra dữ liệu đầu vào cơ bản
            if (!rank_name || current_points === undefined) {
                return res.status(400).json({ success: false, message: "Dữ liệu cập nhật không hợp lệ" });
            }

            await customerService.updateCustomerDetails(id, { rank_name, current_points });

            res.status(200).json({ success: true, message: "Cập nhật thông tin thành công" });
        } catch (error) {
            console.error("Lỗi UpdateInfo:", error.message);
            res.status(500).json({ success: false, message: "Lỗi hệ thống khi cập nhật thông tin" });
        }
    }
};

module.exports = customerController;