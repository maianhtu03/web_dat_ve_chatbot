const express = require('express');
const router = express.Router();
const MovieStatisticsController = require('../controllers/MovieStatisticsController');

// API: GET /api/statistics/movies
router.get('/report', MovieStatisticsController.getReport);
router.get('/branches', MovieStatisticsController.getBranches);

// 3. API lấy danh sách rạp chiếu (THÊM DÒNG NÀY)
// Endpoint: GET /api/statistics/cinemas
router.get('/cinemas', MovieStatisticsController.getCinemas);

module.exports = router;