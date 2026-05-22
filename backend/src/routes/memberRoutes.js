const express = require('express');
const router = express.Router();
const MemberController = require('../controllers/MemberController');

// 1. Lấy thông tin thẻ theo userId (Dùng cho trang Profile)
// Route này khớp với gọi từ FE: /api/memberships/:userId
router.get('/:userId', MemberController.getMemberInfo);
router.get('/history/:userId', MemberController.getPointHistory);

router.post('/spend-points', MemberController.spendPoints);
// 2. Xử lý tích điểm và nâng hạng (Dùng cho logic thanh toán thành công)
// Route này khớp với gọi từ FE: /api/memberships/add-transaction
router.post('/add-transaction', MemberController.processPayment);
router.post('/check-demotion', MemberController.checkDemotion);


module.exports = router;