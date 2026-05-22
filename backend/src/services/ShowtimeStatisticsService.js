const ShowtimeStatisticsModel = require('../models/ShowtimeStatisticsModel');

const ShowtimeStatisticsService = {
    // 1. Lấy dữ liệu báo cáo tổng hợp
    getShowtimeReport: async (filters) => {
        const { startDate, endDate, branchId, cinemaId } = filters;

        try {
            /**
             * Sử dụng Promise.all để chạy song song tất cả các truy vấn SQL.
             * Việc này giúp giảm thời gian chờ (latency) thay vì chạy tuần tự từng cái một.
             */
            const [
                kpi,
                heatmap,
                lowEfficiency,
                timeSlots,
                roomPerformance,
                revenueByFormat, // Dữ liệu mới cho biểu đồ 2D/3D/IMAX
                occupancyTrend,
                overallOccupancy,
                topMoviesRevenue
            ] = await Promise.all([
                ShowtimeStatisticsModel.getKPIs(startDate, endDate, branchId, cinemaId),
                ShowtimeStatisticsModel.getHeatmap(startDate, endDate, branchId, cinemaId),
                ShowtimeStatisticsModel.getLowEfficiencyList(startDate, endDate, branchId, cinemaId),
                ShowtimeStatisticsModel.getTicketsByTimeSlot(startDate, endDate, branchId, cinemaId),
                ShowtimeStatisticsModel.getRoomPerformance(startDate, endDate, branchId, cinemaId),
                ShowtimeStatisticsModel.getRevenueByFormat(startDate, endDate, branchId, cinemaId),
                ShowtimeStatisticsModel.getOccupancyTrend(startDate, endDate, branchId, cinemaId),
                ShowtimeStatisticsModel.getOverallOccupancy(startDate, endDate, branchId, cinemaId),
                ShowtimeStatisticsModel.getTopMoviesRevenue(startDate, endDate, branchId, cinemaId) // <--- THÊM MỚI GỌI MODEL
            ]);

            // Trả về một object duy nhất chứa toàn bộ các mảng dữ liệu để Controller gửi về Client
            return {
                kpi,
                heatmap,
                lowEfficiency,
                timeSlots,
                roomPerformance,
                revenueByFormat,
                occupancyTrend,
                overallOccupancy,
                topMoviesRevenue
            };
        } catch (error) {
            console.error("Error in ShowtimeStatisticsService:", error);
            throw error;
        }
    },

    // 2. Lấy dữ liệu Metadata cho bộ lọc (Chi nhánh & Rạp)
    // Hàm này chạy khi trang Dashboard vừa load để đổ dữ liệu vào các thẻ <select>
    getFilterMetadata: async () => {
        try {
            const [branches, cinemas] = await Promise.all([
                ShowtimeStatisticsModel.getBranches(),
                ShowtimeStatisticsModel.getCinemas()
            ]);

            return { branches, cinemas };
        } catch (error) {
            console.error("Error fetching filter metadata:", error);
            throw error;
        }
    }
};

module.exports = ShowtimeStatisticsService;