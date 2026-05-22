const ShowtimeStatisticsService = require('../services/ShowtimeStatisticsService');

const ShowtimeStatisticsController = {
    // 1. Lấy dữ liệu báo cáo (Dùng cho nút "LỌC DỮ LIỆU")
    getReport: async (req, res) => {
        try {
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                branchId: req.query.branchId,
                cinemaId: req.query.cinemaId
            };
            const data = await ShowtimeStatisticsService.getShowtimeReport(filters);
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 2. THÊM HÀM NÀY: Lấy danh sách Chi nhánh & Rạp cho bộ lọc
    // Hàm này sẽ được gọi ngay khi trang vừa load (useEffect trong React)
    getFilters: async (req, res) => {
        try {
            const data = await ShowtimeStatisticsService.getFilterMetadata();
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = ShowtimeStatisticsController;