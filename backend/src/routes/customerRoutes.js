const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Khớp với các hàm gọi từ Frontend
router.get('/', customerController.getAllCustomers);
router.patch('/:id/status', customerController.updateStatus);
router.put('/:id', customerController.updateInfo);

module.exports = router;