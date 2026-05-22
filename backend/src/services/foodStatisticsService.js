const FoodStatisticsModel = require('../models/foodStatisticsModel');

/**
 * 1. Lấy báo cáo chi tiết thống kê đồ ăn
 */
const getFoodReport = async (startDate, endDate, branchId, cinemaId) => {
    try {
        // Thực hiện truy vấn song song các chỉ số thống kê từ Model
        const [summary, distribution, topItems, quantityByCinema, detailRevenueByCinema, revenueTrend] = await Promise.all([
            FoodStatisticsModel.getSummary(startDate, endDate, branchId, cinemaId),
            FoodStatisticsModel.getDistribution(startDate, endDate, branchId, cinemaId),
            FoodStatisticsModel.getTopItems(startDate, endDate, branchId, cinemaId),
            FoodStatisticsModel.getQuantityByCinema(startDate, endDate, branchId, cinemaId),
            FoodStatisticsModel.getRevenueDetailByCinema(startDate, endDate, branchId, cinemaId),
            FoodStatisticsModel.getRevenueTrend(startDate, endDate, branchId, cinemaId) // <--- Dòng thêm mới
        ]);

        return {
            // Các thẻ KPI tổng quan
            totalRevenue: summary.totalRevenue || 0,
            totalQuantity: summary.totalQuantity || 0,
            bestSeller: topItems[0]?.name || "N/A",

            // Dữ liệu cho Pie Chart (Phân bổ doanh thu theo rạp)
            distributionData: distribution,

            // Dữ liệu cho Bar Chart (Top 5 sản phẩm bán chạy)
            topComboData: topItems,

            // Dữ liệu cho Stacked Bar Chart (Số lượng theo rạp)
            quantityData: quantityByCinema,

            // Dữ liệu cho Stacked Bar Chart (Doanh thu chi tiết theo rạp)
            detailRevenueData: detailRevenueByCinema,
            trendData: revenueTrend
        };
    } catch (error) {
        throw new Error("Lỗi tại Service khi xử lý dữ liệu thống kê: " + error.message);
    }
};

/**
 * 2. Lấy danh sách chi nhánh (Chuyển tiếp từ Model)
 * Giúp đồng bộ bộ lọc trên UI
 */
const getBranches = async () => {
    try {
        return await FoodStatisticsModel.getBranches();
    } catch (error) {
        throw new Error("Lỗi tại Service khi lấy danh sách chi nhánh: " + error.message);
    }
};

/**
 * 3. Lấy danh sách rạp (Chuyển tiếp từ Model)
 */
const getCinemas = async () => {
    try {
        return await FoodStatisticsModel.getCinemas();
    } catch (error) {
        throw new Error("Lỗi tại Service khi lấy danh sách rạp: " + error.message);
    }
};

// Export đầy đủ các hàm để Controller sử dụng
module.exports = {
    getFoodReport,
    getBranches,
    getCinemas
};