const statisticModel = require('../models/statisticModel');

const getOverview = async (filters) => {
    // 1. Phân tách các filter (bao gồm cả mốc ngày quá khứ từ controller)
    const { branchId, cinemaId, startDate, endDate, prevStartDate, prevEndDate } = filters;

    // 2. Chuyển đổi giá trị 'all' hoặc rỗng thành null để Model xử lý SQL (? IS NULL)
    const branchFilter = branchId === 'all' || !branchId ? null : branchId;
    const cinemaFilter = cinemaId === 'all' || !cinemaId ? null : cinemaId;

    // 3. Gọi Model lấy dữ liệu GIAI ĐOẠN HIỆN TẠI và các biểu đồ
    const [currentStats, revenueChart, showtimeStatus, topMovies, heatmapData] = await Promise.all([
        statisticModel.getStats(branchFilter, cinemaFilter, startDate, endDate),
        statisticModel.getRevenueChart(branchFilter, cinemaFilter, startDate, endDate),
        statisticModel.getShowtimeStatus(branchFilter, cinemaFilter, startDate, endDate),
        statisticModel.getTopMovies(branchFilter, cinemaFilter, startDate, endDate),
        statisticModel.getShowtimeHeatmap(branchFilter, cinemaFilter, startDate, endDate)
    ]);

    // 4. Gọi Model lấy dữ liệu GIAI ĐOẠN TRƯỚC ĐÓ (Chỉ cần lấy Card stats để so sánh)
    const previousStats = await statisticModel.getStats(branchFilter, cinemaFilter, prevStartDate, prevEndDate);

    // 5. Hàm tính toán % tăng trưởng (Trend)
    const calculateTrend = (current, previous) => {
        // Ép kiểu về số để tránh lỗi cộng chuỗi
        const curr = parseFloat(current) || 0;
        const prev = parseFloat(previous) || 0;

        if (prev === 0) return curr > 0 ? 100 : 0; // Nếu kỳ trước bằng 0 mà kỳ này có khách thì tăng 100%
        const trend = ((curr - prev) / prev) * 100;
        return parseFloat(trend.toFixed(1)); // Lấy 1 chữ số thập phân (ví dụ: 15.5%)
    };

    // 6. Trả về cấu trúc dữ liệu mới bao gồm giá trị và phần trăm tăng trưởng
    return {
        cards: {
            revenue: {
                value: currentStats.revenue,
                trend: calculateTrend(currentStats.revenue, previousStats.revenue)
            },
            tickets: {
                value: currentStats.tickets,
                trend: calculateTrend(currentStats.tickets, previousStats.tickets)
            },
            shows: {
                value: currentStats.shows,
                trend: calculateTrend(currentStats.shows, previousStats.shows)
            },
            users: {
                value: currentStats.users,
                trend: calculateTrend(currentStats.users, previousStats.users)
            }
        },
        revenueChart,
        showtimeStatus,
        topMovies,
        heatmapData
    };
};

module.exports = { getOverview };