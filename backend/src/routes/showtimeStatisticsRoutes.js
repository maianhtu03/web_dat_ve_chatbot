const express = require('express');
const router = express.Router();
const ShowtimeStatisticsController = require('../controllers/ShowtimeStatisticsController');

// 1. Route lấy dữ liệu thống kê (KPI, biểu đồ...)
router.get('/report', ShowtimeStatisticsController.getReport);

// 2. Route lấy dữ liệu mồi cho bộ lọc (Chi nhánh & Rạp)
// Frontend sẽ gọi API này để đổ dữ liệu vào các ô Select
router.get('/filters', ShowtimeStatisticsController.getFilters);

module.exports = router;