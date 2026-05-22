const express = require('express');
const router = express.Router();
const statisticController = require('../controllers/statisticController');

// API lấy dữ liệu tổng hợp cho trang Dashboard
router.get('/overview', statisticController.getOverviewData);
router.get('/branches', statisticController.getBranchesList);
router.get('/cinemas/:branchId', statisticController.getCinemasByBranch);

module.exports = router;