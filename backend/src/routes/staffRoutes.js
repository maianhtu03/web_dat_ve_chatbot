const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

// --- CÁC ROUTE LẤY DỮ LIỆU BỔ TRỢ (Đặt lên trên đầu) ---

// Lấy danh sách rạp phim (Fix lỗi 404 /api/staff/cinemas)
router.get('/cinemas', staffController.getTheaters);

// Lấy danh sách tất cả các quyền hạn có trong hệ thống
router.get('/permissions', staffController.getPermissions);


// Thêm route này vào
router.get('/:id/permissions', staffController.getStaffPermissions);
// --- QUẢN LÝ NHÂN VIÊN ---

// Lấy danh sách nhân viên (Admin/Staff)
router.get('/', staffController.getStaffs);

// Tạo mới nhân viên
router.post('/', staffController.addStaff);

// Xóa nhân viên theo ID
router.delete('/:id', staffController.deleteStaff);


// --- QUẢN LÝ PHÂN QUYỀN ---

// Gán quyền cho một nhân viên cụ thể
router.post('/permissions/assign', staffController.setPermissions);

module.exports = router;