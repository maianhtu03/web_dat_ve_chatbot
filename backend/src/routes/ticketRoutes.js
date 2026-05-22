const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

// API lấy toàn bộ danh sách vé (Giao diện chính)
router.get('/admin/tickets', ticketController.getTickets);

// API lấy chi tiết một vé (Giao diện chi tiết khi click xem)
router.get('/admin/tickets/:id', ticketController.getTicketById);
router.patch('/admin/tickets/:id/checkin', ticketController.checkInTicket);
router.get('/options', ticketController.getFilterOptions);

module.exports = router;