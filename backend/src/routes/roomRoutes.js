const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// --- 1. CÁC ROUTE LẤY DỮ LIỆU (GET) ---

// Lấy toàn bộ danh sách phòng (cho Table)
router.get('/types/all', roomController.getRoomTypes);
router.get('/', roomController.getRooms);
// Lấy danh sách rạp ĐANG MỞ theo chi nhánh (cho Dropdown trong Modal)
// Chú ý: Route này cực kỳ quan trọng để giải quyết vấn đề bạn gặp phải
router.get('/cinemas-by-branch/:branchId', roomController.getCinemasByBranch);
router.get('/by-cinema/:cinemaId', roomController.getRoomsByCinema);
// Lấy chi tiết 1 phòng (cho Modal Edit)
router.get('/:id', roomController.getRoomById);
// --- 2. ROUTE TẠO MỚI (POST) ---
router.post('/add', roomController.addRoom);
// --- 3. CÁC ROUTE CẬP NHẬT(PUT) ---
// Cập nhật trạng thái bật/tắt (is_active)
router.put('/status/:id', roomController.updateStatus);
// Cập nhật thông tin chung
router.put('/:id', roomController.updateRoom);
// --- 4. ROUTE XÓA (DELETE) ---
router.delete('/:id', roomController.deleteRoom);

module.exports = router;