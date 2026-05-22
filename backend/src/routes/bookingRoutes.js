const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
// Nếu bạn có middleware xác thực người dùng (JWT), hãy import vào đây
// const { verifyToken } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/bookings/create
 * @desc    Tạo đơn hàng mới và giữ ghế tạm thời (status: reserved)
 * @access  Private (Cần đăng nhập)
 */
router.post('/create', bookingController.createBooking);

/**
 * @route   GET /api/bookings/:id
 * @desc    Lấy thông tin chi tiết của một đơn hàng (Dùng để hiển thị sau thanh toán)
 * @access  Private
 */
router.get('/:id', bookingController.getBookingById);

/**
 * @route   GET /api/bookings/user/:userId
 * @desc    Lấy lịch sử đặt vé của một người dùng
 * @access  Private
 */
router.get('/user/:userId', bookingController.getUserBookings);

module.exports = router;