const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const MomoController = require('../controllers/MomoController');
/**
 * @route   POST /api/payment/create-url
 * @desc    Lấy thông tin đơn hàng và tạo đường dẫn thanh toán sang VNPAY
 * @access  Public/Private (Nên dùng verifyToken để bảo mật)
 */
router.post('/create-url', paymentController.createVnpayUrl);

/**
 * @route   GET /api/payment/vnpay-return
 * @desc    Nơi VNPAY phản hồi kết quả sau khi khách thanh toán xong
 * @access  Public (VNPAY gọi trực tiếp vào đây)
 */
router.get('/vnpay-return', paymentController.vnpayReturn);



router.post('/momo/create-url', MomoController.createMomoUrl);
router.post('/momo/ipn', MomoController.handleMomoIPN);

module.exports = router;