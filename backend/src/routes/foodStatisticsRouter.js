const express = require('express');
const router = express.Router();
const foodStatisticsController = require('../controllers/foodStatisticsController');

/**
 * @route   GET /api/statistics/food/report
 * @desc    Lấy thống kê doanh thu combo và đồ ăn (Hỗ trợ lọc theo ngày, chi nhánh, rạp)
 * @access  Private/Admin
 */
router.get('/report', foodStatisticsController.getFoodStatistics);

/**
 * @route   GET /api/statistics/food/branches
 * @desc    Lấy danh sách chi nhánh phục vụ bộ lọc
 * @access  Private/Admin
 */
router.get('/branches', foodStatisticsController.getBranches);

/**
 * @route   GET /api/statistics/food/cinemas
 * @desc    Lấy danh sách rạp chiếu phục vụ bộ lọc (có thể lọc theo branchId)
 * @access  Private/Admin
 */
router.get('/cinemas', foodStatisticsController.getCinemas);

module.exports = router;