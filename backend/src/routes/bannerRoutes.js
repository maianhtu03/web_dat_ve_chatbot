const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads/banners';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Banners thường nặng nên để 10MB
});

// --- ROUTES ---
router.get('/', bannerController.getAllBanners);
router.get('/:id', bannerController.getBannerById);
router.put('/:id', upload.array('images', 1), bannerController.updateBanner);
// Lưu ý: Dùng upload.array('images') để nhận nhiều file cùng lúc
router.post('/add', upload.array('images', 10), bannerController.addBanners);

router.put('/:id/status', bannerController.updateStatus);
router.delete('/:id', bannerController.deleteBanner);

module.exports = router;