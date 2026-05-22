const express = require('express');
const router = express.Router();
const templateController = require('../controllers/seatTemplateController');

// 1. Lấy danh sách tất cả các mẫu
router.get('/', templateController.getTemplates);

// 2. Lấy chi tiết 1 mẫu (Bao gồm thông tin mẫu + danh sách ghế để vẽ sơ đồ)
router.get('/:id', templateController.getTemplateDetail);

// 3. Thêm mới mẫu sơ đồ ghế (Tự động sinh ghế trong Service)
router.post('/', templateController.addTemplate); // Bỏ /add để dùng chuẩn POST trên root

// 4. Cập nhật thông tin cơ bản (Tên, mô tả, phân loại hàng)
router.put('/:id', templateController.updateTemplateInfo); // Dùng PUT /:id thay vì /update/:id

// 5. Cập nhật trạng thái hoạt động (Nút gạt Active/Inactive)
router.patch('/:id/status', templateController.updateStatus); // Dùng PATCH vì chỉ cập nhật 1 phần dữ liệu

// 6. Cập nhật chi tiết TỪNG GHẾ (Dùng cho SeatEditor: đổi loại ghế, ẩn/hiện ghế)
router.put('/seats/:seatId', templateController.updateSingleSeat);
router.put('/:id/broken-seats', templateController.updateBrokenSeats);

router.get('/seats/:id', templateController.getTemplateSeats);
router.put('/rows/:templateId/:rowLabel', templateController.updateRowStatus);
// 7. Xóa mẫu sơ đồ (Xóa mẫu + Xóa ghế nhờ Cascade)
router.delete('/:id', templateController.deleteTemplate);

module.exports = router;