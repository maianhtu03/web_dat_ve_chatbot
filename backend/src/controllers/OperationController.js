const OperationService = require('../services/OperationService');

const getStatistics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        // Nếu không gửi ngày, mặc định lấy ngày hôm nay
        const start = startDate || new Date().toISOString().split('T')[0];
        const end = endDate || start;

        const data = await OperationService.getOperationStats(start, end);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getStatistics };