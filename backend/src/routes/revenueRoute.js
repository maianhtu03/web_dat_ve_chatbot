const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenueController');

router.get('/report', revenueController.getRevenueReport);

router.get('/branches', revenueController.getBranchesList);

// 3. API lấy danh sách Rạp theo Chi nhánh (MỚI)
// Dùng để lọc danh sách rạp khi người dùng chọn một chi nhánh cụ thể
router.get('/cinemas/:branchId', revenueController.getCinemasByBranch);
module.exports = router;