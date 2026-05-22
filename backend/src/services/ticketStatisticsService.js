const ticketStatisticsModel = require('../models/ticketStatisticsModel');

const ticketStatisticsService = {
    getTicketStatisticsDashboard: async (startDate, endDate, branchId, cinemaId) => {
        // --- CHUẨN HÓA THAM SỐ (Logic cũ của Tú - Giữ nguyên rất tốt) ---
        const bId = branchId === 'all' || !branchId ? null : branchId;
        const cId = cinemaId === 'all' || !cinemaId ? null : cinemaId;

        const [
            ticketTypes,
            peakHours,
            occupancy,
            trend,
            topMovies
        ] = await Promise.all([
            ticketStatisticsModel.getTicketTypeDistribution(startDate, endDate, bId, cId),
            ticketStatisticsModel.getPeakBookingHours(startDate, endDate, bId, cId),
            ticketStatisticsModel.getTheaterOccupancyRates(startDate, endDate, bId, cId),
            ticketStatisticsModel.getTicketTrend(startDate, endDate, bId, cId),
            ticketStatisticsModel.getTopMovies(startDate, endDate, bId, cId)
        ]);

        return {
            ticketTypeData: ticketTypes,
            peakHourData: peakHours,
            occupancyData: occupancy,
            ticketTrendData: trend,
            topMoviesData: topMovies
        };
    },

    // --- BỔ SUNG 2 HÀM NÀY ĐỂ KHÔNG BỊ LỖI KHI GỌI TỪ CONTROLLER ---
    // Logic: Gọi trực tiếp xuống Model đã có sẵn hàm này
    getAllBranches: async () => {
        return await ticketStatisticsModel.getAllBranches();
    },

    getCinemasByBranch: async (branchId) => {
        // Chuẩn hóa branchId trước khi đưa xuống Model
        const bId = branchId === 'all' || !branchId ? null : branchId;
        return await ticketStatisticsModel.getCinemasByBranch(bId);
    }
};

module.exports = ticketStatisticsService;