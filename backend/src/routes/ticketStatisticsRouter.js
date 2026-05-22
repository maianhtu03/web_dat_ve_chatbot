const express = require('express');
const router = express.Router();
const ticketStatisticsController = require('../controllers/ticketStatisticsController');

// 1. API lấy dữ liệu thống kê (Biểu đồ, con số tổng quát)
// URL: GET /api/statistics/tickets?startDate=...&endDate=...&branchId=...
router.get('/tickets', ticketStatisticsController.getTicketReport);

// 2. API lấy danh sách chi nhánh (Đổ vào Dropdown Chi nhánh)
// URL: GET /api/statistics/branches
router.get('/branches', ticketStatisticsController.getBranches);

// 3. API lấy danh sách rạp theo chi nhánh (Đổ vào Dropdown Rạp)
// URL: GET /api/statistics/cinemas
router.get('/cinemas', ticketStatisticsController.getCinemas);

module.exports = router;