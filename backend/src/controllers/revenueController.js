const revenueService = require('../services/revenueService');
const revenueModel = require('../models/revenueModel');
const getRevenueReport = async (req, res) => {
    try {
        // 1. Lấy tham số từ query
        let { startDate, endDate, branchId, cinemaId } = req.query;

        // --- BỔ SUNG: Xử lý ngày mặc định nếu FE không gửi ---
        // Giúp trang web không bị lỗi khi vừa mới load lần đầu
        const today = new Date().toISOString().split('T')[0];
        if (!endDate) endDate = today;

        if (!startDate) {
            const lastMonth = new Date();
            lastMonth.setDate(lastMonth.getDate() - 30); // Mặc định lấy 30 ngày gần đây
            startDate = lastMonth.toISOString().split('T')[0];
        }

        // 2. Kiểm tra định dạng ngày (Giữ nguyên logic của Tú - rất tốt)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            return res.status(400).json({
                success: false,
                message: "Định dạng ngày không hợp lệ. Vui lòng dùng YYYY-MM-DD."
            });
        }

        // 3. Gọi Service xử lý logic
        // Chuyển đổi 'all' thành null ngay tại đây để Service/Model làm việc mượt hơn
        const data = await revenueService.generateRevenueReport(
            startDate,
            endDate,
            branchId === 'all' || !branchId ? null : branchId,
            cinemaId === 'all' || !cinemaId ? null : cinemaId
        );

        // 4. Trả về kết quả
        res.status(200).json({
            success: true,
            filters: { startDate, endDate, branchId, cinemaId }, // Trả về ngược lại để FE đồng bộ UI
            data
        });

    } catch (error) {
        console.error("Revenue Controller Error:", error);
        res.status(500).json({
            success: false,
            message: "Đã có lỗi xảy ra khi lấy báo cáo doanh thu.",
            error: error.message
        });
    }
};
const getBranchesList = async (req, res) => {
    try {
        // KIỂM TRA: Trong revenueModel phải có hàm getAllBranches
        const branches = await revenueModel.getAllBranches();
        res.json({ success: true, data: branches });
    } catch (error) {
        console.error("Lỗi tại getBranchesList:", error); // Thêm dòng này để xem lỗi ở Terminal
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCinemasByBranch = async (req, res) => {
    try {
        const { branchId } = req.params;
        // KIỂM TRA: Trong revenueModel phải có hàm getCinemasByBranch
        const cinemas = await revenueModel.getCinemasByBranch(branchId);
        res.json({ success: true, data: cinemas });
    } catch (error) {
        console.error("Lỗi tại getCinemasByBranch:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getRevenueReport, getBranchesList,
    getCinemasByBranch
};