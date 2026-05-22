const VoucherService = require('../services/VoucherService');

const VoucherController = {
    // ==========================================
    // LOGIC CHO ADMIN (Đã có của bạn)
    // ==========================================

    // GET /api/vouchers/admin/all
    listVouchers: async (req, res) => {
        try {
            const vouchers = await VoucherService.getAllVouchers();
            res.json(vouchers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // POST /api/vouchers/admin/create
    addVoucher: async (req, res) => {
        try {
            const voucherId = await VoucherService.createVoucher(req.body);
            res.status(201).json({
                message: "Tạo voucher thành công!",
                voucherId
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
    getVoucherDetail: async (req, res) => {
        try {
            const { id } = req.params;
            const voucher = await VoucherService.getVoucherById(id);
            if (!voucher) {
                return res.status(404).json({ message: "Không tìm thấy voucher" });
            }
            res.json(voucher);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // 4. CẬP NHẬT VOUCHER (BỔ SUNG - Đây là cái nút "Lưu" sau khi sửa cần)
    updateVoucher: async (req, res) => {
        try {
            const { id } = req.params;
            const success = await VoucherService.updateVoucher(id, req.body);
            if (success) {
                res.json({ message: "Cập nhật voucher thành công!" });
            } else {
                res.status(404).json({ message: "Cập nhật thất bại hoặc không tìm thấy voucher" });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // 5. XÓA VOUCHER (BỔ SUNG - Để nút Thùng rác hoạt động)
    deleteVoucher: async (req, res) => {
        try {
            const { id } = req.params;
            const success = await VoucherService.deleteVoucher(id);
            if (success) {
                res.json({ message: "Xóa voucher thành công!" });
            } else {
                res.status(404).json({ message: "Không tìm thấy voucher để xóa" });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // ==========================================
    // LOGIC CHO USER (CẦN BỔ SUNG)
    // ==========================================

    /**
     * Lấy danh sách voucher trong "Ví" của từng User
     * GET /api/vouchers/my-vouchers/:userId
     */
    getMyVouchers: async (req, res) => {
        try {
            const { userId } = req.params;
            const vouchers = await VoucherService.getUserVouchers(userId);
            res.json(vouchers);
        } catch (error) {
            console.error("Lỗi lấy voucher cá nhân:", error);
            res.status(500).json({ message: "Không thể lấy kho voucher của bạn" });
        }
    },

    /**
     * Kiểm tra và tính toán giảm giá khi User áp dụng mã lúc đặt vé
     * POST /api/vouchers/apply
     */
    applyVoucher: async (req, res) => {
        try {
            const { userId, voucherCode, orderValue } = req.body;

            // Gọi service để kiểm tra hạn dùng, điều kiện đơn hàng, sở hữu...
            const result = await VoucherService.validateAndApply(userId, voucherCode, orderValue);

            res.status(200).json({
                message: "Áp dụng mã giảm giá thành công!",
                data: result
            });
        } catch (error) {
            // Trả về lỗi cụ thể (VD: Mã hết hạn, đơn hàng chưa đủ mốc...)
            res.status(400).json({ message: error.message });
        }
    }
    // Thêm vào VoucherService.js

};

module.exports = VoucherController;