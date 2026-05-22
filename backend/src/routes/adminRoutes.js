const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { verifyToken } = require('../middlewares/authMiddleware');

// API lấy danh sách quyền để Admin chọn
router.get('/permissions', verifyToken, roleController.getAllPermissions);

// API lưu quyền sau khi Admin đã tích chọn Checkbox
router.post('/assign-permissions', verifyToken, roleController.assignPermissions);

// API xem danh sách nhân viên để quản lý
router.get('/staffs', verifyToken, roleController.getStaffList);

module.exports = router;