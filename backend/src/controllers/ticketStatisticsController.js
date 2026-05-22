const ticketStatisticsService = require('../services/ticketStatisticsService');

const ticketStatisticsController = {
    getTicketReport: async (req, res) => {
        try {
            // 1. Lấy tham số và chuẩn hóa ngay tại đầu vào
            let { startDate, endDate, branchId, cinemaId } = req.query;

            // Mặc định ngày nếu không truyền (Dùng 'sv-SE' để ra định dạng YYYY-MM-DD chuẩn)
            const today = new Date().toLocaleDateString('sv-SE');
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('sv-SE');

            const end = endDate || today;
            const start = startDate || thirtyDaysAgo;

            // Chuẩn hóa: Nếu là 'all', 'undefined' hoặc chuỗi rỗng thì đưa về null
            const cleanBranchId = (branchId === 'all' || branchId === 'undefined' || !branchId) ? null : branchId;
            const cleanCinemaId = (cinemaId === 'all' || cinemaId === 'undefined' || !cinemaId) ? null : cinemaId;

            // 2. Kiểm tra logic ngày
            if (new Date(start) > new Date(end)) {
                return res.status(400).json({
                    success: false,
                    message: "Ngày bắt đầu không thể lớn hơn ngày kết thúc"
                });
            }

            // 3. Gọi service với dữ liệu đã "sạch"
            const stats = await ticketStatisticsService.getTicketStatisticsDashboard(
                start,
                end,
                cleanBranchId,
                cleanCinemaId
            );

            res.status(200).json({
                success: true,
                message: "Lấy thống kê vé thành công",
                data: stats
            });
        } catch (error) {
            console.error("Error in getTicketReport:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi hệ thống khi lấy thống kê vé",
                error: error.message
            });
        }
    },

    getBranches: async (req, res) => {
        try {
            const branches = await ticketStatisticsService.getAllBranches();
            res.status(200).json({
                success: true,
                data: branches
            });
        } catch (error) {
            console.error("Error in getBranches:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getCinemas: async (req, res) => {
        try {
            const { branchId } = req.query;

            // Tương tự, chuẩn hóa branchId trước khi đưa vào Service
            const cleanBranchId = (branchId === 'all' || branchId === 'undefined' || !branchId) ? null : branchId;

            const cinemas = await ticketStatisticsService.getCinemasByBranch(cleanBranchId);
            res.status(200).json({
                success: true,
                data: cinemas
            });
        } catch (error) {
            console.error("Error in getCinemas:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = ticketStatisticsController;