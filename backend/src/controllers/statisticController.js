const statisticService = require('../services/statisticService');
const statisticModel = require('../models/statisticModel');
const getOverviewData = async (req, res) => {
    try {
        // 1. Lấy các tham số lọc từ req.query
        // URL mẫu: /api/stats/overview?branchId=1&cinemaId=2&startDate=2026-04-01&endDate=2026-04-26
        const { branchId, cinemaId, startDate, endDate } = req.query;

        // 2. Xử lý logic ngày mặc định nếu User không chọn
        // Nếu không có ngày, mình để mặc định là từ 7 ngày trước đến hôm nay
        const today = new Date().toISOString().split('T')[0];
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const defaultStartDate = lastWeek.toISOString().split('T')[0];


        // --- PHẦN QUAN TRỌNG: XỬ LÝ NGÀY ĐỂ TÍNH PHẦN TRĂM ---
        const finalStartDate = startDate || defaultStartDate;
        const finalEndDate = endDate || today;

        // --- PHẦN QUAN TRỌNG: XỬ LÝ NGÀY ĐỂ TÍNH PHẦN TRĂM ---
        // Sử dụng finalStartDate và finalEndDate đã gán ở trên
        const start = new Date(finalStartDate);
        const end = new Date(finalEndDate);
        // Tính số ngày chênh lệch (Ví dụ: lọc 7 ngày thì so sánh với 7 ngày trước đó)
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const prevStartDate = new Date(start);
        prevStartDate.setDate(prevStartDate.getDate() - diffDays);
        const prevEndDate = new Date(start);
        prevEndDate.setDate(prevEndDate.getDate() - 1);
        const filters = {
            branchId: branchId || 'all',
            cinemaId: cinemaId || 'all',
            startDate: finalStartDate,
            endDate: finalEndDate,
            prevStartDate: prevStartDate.toISOString().split('T')[0],
            prevEndDate: prevEndDate.toISOString().split('T')[0]
        };

        // 3. Truyền đối tượng filters vào Service
        const data = await statisticService.getOverview(filters);

        return res.status(200).json({
            success: true,
            message: "Lấy dữ liệu thống kê thành công",
            filters: filters, // Trả về cả filter để Frontend đồng bộ UI
            data: data
        });

    } catch (error) {
        console.error("Error in statisticController:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi lấy dữ liệu thống kê tổng quan",
            error: error.message
        });
    }
};
const getBranchesList = async (req, res) => {
    try {
        const branches = await statisticModel.getAllBranches();
        res.json({ success: true, data: branches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCinemasByBranch = async (req, res) => {
    try {
        const { branchId } = req.params;
        const cinemas = await statisticModel.getCinemasByBranch(branchId);
        res.json({ success: true, data: cinemas });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getOverviewData, getBranchesList, getCinemasByBranch
};