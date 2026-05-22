const express = require('express');
const router = express.Router();
const priceController = require('../controllers/priceController');

// Khớp với URL: http://localhost:5000/api/prices/...
router.get('/configs', priceController.getAllConfigs);
// Đường dẫn này phải khớp với URL mà priceApi.deleteFullConfig ở Frontend đang gọi
router.delete('/cinema/:cinemaId/all', priceController.deleteFullConfig);
router.get('/cinema/:cinemaId/current', priceController.getCurrentBasePrice);
router.get('/cinema/:cinemaId', priceController.getPriceConfig);
router.post('/save-all', priceController.savePriceConfig);


module.exports = router;