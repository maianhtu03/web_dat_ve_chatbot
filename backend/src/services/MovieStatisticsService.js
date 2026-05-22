const MovieStatisticsModel = require('../models/MovieStatisticsModel');

const MovieStatisticsService = {
    getMovieReport: async (filters) => {
        const { startDate, endDate, branchId, cinemaId } = filters;

        try {
            const [
                summary,
                revenueByCinema,
                genreStats,
                hotVsNormal,
                topMovies,
                ticketsByMovie,
                revenueByMovie,
                occupancyRateByMovie
            ] = await Promise.all([
                // 1. Dữ liệu 5 thẻ Card
                MovieStatisticsModel.getSummary(startDate, endDate, branchId, cinemaId),

                // 2. Doanh thu phim theo rạp
                MovieStatisticsModel.getRevenueByCinema(startDate, endDate, branchId, cinemaId),

                // 3. Doanh thu theo thể loại
                MovieStatisticsModel.getGenreStats(startDate, endDate, branchId, cinemaId),

                // 4. Phim Hot vs Phim Thường
                MovieStatisticsModel.getHotVsNormalStats(startDate, endDate, branchId, cinemaId),

                // 5. Top 5 phim bán chạy (Dùng cho bảng hoặc list)
                MovieStatisticsModel.getTopMoviesList(startDate, endDate, branchId, cinemaId),

                // 6. THÊM Ở ĐÂY: Biểu đồ Vé theo phim (Bar Chart bắt buộc)
                MovieStatisticsModel.getTicketsByMovieStats(startDate, endDate, branchId, cinemaId),
                MovieStatisticsModel.getRevenueByMovieStats(startDate, endDate, branchId, cinemaId), // <--- THÊM DÒNG NÀY
                MovieStatisticsModel.getOccupancyRateByMovie(startDate, endDate, branchId, cinemaId)
            ]);

            return {
                summary,
                revenueByCinema,
                genreStats,
                hotVsNormal,
                topMovies,
                ticketsByMovie,
                revenueByMovie,
                occupancyRateByMovie
            };
        } catch (error) {
            console.error("Lỗi tại MovieStatisticsService:", error.message);
            throw error;
        }
    }
};

module.exports = MovieStatisticsService;