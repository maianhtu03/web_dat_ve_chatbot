const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtimeController');

// Lấy danh sách
router.get('/', showtimeController.getShowtimes);
router.put('/:id', showtimeController.updateShowtime);
// Ví dụ trong file route của bạn
router.get('/booking/:id', showtimeController.getBookingData);
// Thêm mới
router.post('/', showtimeController.addShowtime);
router.get('/:id', showtimeController.getShowtimeById);
router.post('/multiple', showtimeController.addMultipleShowtimes);
router.patch('/:id/status', showtimeController.updateStatus);
router.get('/room/:roomId', showtimeController.getScheduleByRoom); // Khớp với API fetch
router.delete('/:id', showtimeController.deleteShowtime);
router.get('/cinema/:cinemaId/schedule', showtimeController.getCinemaSchedule);

module.exports = router;