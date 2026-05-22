const foodStatisticsService = require('../services/foodStatisticsService');

/**
 * 1. Lấy dữ liệu thống kê đồ ăn (Giữ nguyên logic cũ, đảm bảo truyền đủ params)
 */
const getFoodStatistics = async (req, res) => {
    const { startDate, endDate, branchId, cinemaId } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({
            success: false,
            message: "Ngày bắt đầu và ngày kết thúc là bắt buộc (YYYY-MM-DD)"
        });
    }

    try {
        const data = await foodStatisticsService.getFoodReport(
            startDate,
            endDate,
            branchId || 'all',
            cinemaId || 'all'
        );

        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * 2. Lấy danh sách chi nhánh phục vụ bộ lọc
 */
const getBranches = async (req, res) => {
    try {
        // Gọi hàm getBranches từ service (service này sẽ gọi Model.getBranches)
        const branches = await foodStatisticsService.getBranches();

        res.status(200).json({
            success: true,
            data: branches
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách chi nhánh: " + error.message
        });
    }
};

/**
 * 3. Lấy danh sách rạp phục vụ bộ lọc
 */
const getCinemas = async (req, res) => {
    try {
        const { branchId } = req.query;

        // Gọi service lấy danh sách rạp
        let cinemas = await foodStatisticsService.getCinemas();

        // LOGIC QUAN TRỌNG: Nếu có branchId, hãy lọc danh sách rạp theo chi nhánh đó
        // Giúp Frontend hiển thị đúng các rạp thuộc chi nhánh đang chọn
        if (branchId && branchId !== 'all') {
            cinemas = cinemas.filter(c => c.branch_id === parseInt(branchId));
        }

        res.status(200).json({
            success: true,
            data: cinemas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách rạp: " + error.message
        });
    }
};

module.exports = {
    getFoodStatistics,
    getBranches,
    getCinemas
};