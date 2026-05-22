const MovieStatisticsService = require('../services/MovieStatisticsService');
const MovieStatisticsModel = require('../models/MovieStatisticsModel'); // Cần thêm Model để gọi trực tiếp metadata

const MovieStatisticsController = {
    // 1. Hàm lấy báo cáo (Giữ nguyên của bạn, chỉ cần thêm data rỗng để an toàn)
    getReport: async (req, res) => {
        try {
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                branchId: req.query.branchId || null,
                cinemaId: req.query.cinemaId || null
            };

            if (!filters.startDate || !filters.endDate) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc"
                });
            }

            const data = await MovieStatisticsService.getMovieReport(filters);

            res.status(200).json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error("Error in Movie Statistics Controller:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi hệ thống khi lấy dữ liệu thống kê"
            });
        }
    },

    // 2. THÊM HÀM NÀY: Lấy danh sách chi nhánh
    getBranches: async (req, res) => {
        try {
            // Lưu ý: Bạn cần thêm hàm getBranches vào MovieStatisticsModel như mình hướng dẫn ở bước trước
            const branches = await MovieStatisticsModel.getBranches();
            res.status(200).json({
                success: true,
                data: branches // Trả về mảng [ {id, name}, ... ]
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 3. THÊM HÀM NÀY: Lấy danh sách rạp
    getCinemas: async (req, res) => {
        try {
            const cinemas = await MovieStatisticsModel.getCinemas();
            res.status(200).json({
                success: true,
                data: cinemas // Trả về mảng [ {id, name, branch_id}, ... ]
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = MovieStatisticsController;