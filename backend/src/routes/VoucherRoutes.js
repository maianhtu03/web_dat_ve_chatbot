const express = require('express');
const router = express.Router();
const VoucherController = require('../controllers/VoucherController');

// ==========================================
// ROUTES DÀNH CHO ADMIN (Quản lý kho)
// ==========================================

// Lấy toàn bộ danh sách voucher để hiển thị ở bảng Admin
router.get('/admin/all', VoucherController.listVouchers);

// Lưu voucher mới được tạo từ Form Admin
router.post('/admin/create', VoucherController.addVoucher);
router.get('/admin/detail/:id', VoucherController.getVoucherDetail);


router.put('/admin/update/:id', VoucherController.updateVoucher);


router.delete('/admin/delete/:id', VoucherController.deleteVoucher);
/**

 */
router.get('/my-vouchers/:userId', VoucherController.getMyVouchers);

/**

 */
router.post('/apply', VoucherController.applyVoucher);

module.exports = router;