const express = require('express');
const router = express.Router();
const cinemaController = require('../controllers/cinemaController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Cấu hình Multer cho Cinema ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Lưu vào public để Express static có thể phục vụ ảnh
        const dir = 'public/uploads/cinemas';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Tạo tên file duy nhất tránh trùng lặp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'cinema-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

// --- Nhóm Route giữ nguyên Logic cũ ---
router.get('/branch/:branchId', cinemaController.getActiveCinemasByBranch);
router.get('/', cinemaController.getCinemas);
router.get('/:id', cinemaController.getCinemaById);
// --- Sửa Route POST và PUT để nhận Ảnh (dùng upload.single) ---
// Note: 'image_url' là name của field gửi từ FormData ở Frontend
router.post('/add', upload.single('image_url'), cinemaController.addCinema);
router.put('/:id', upload.single('image_url'), cinemaController.updateCinema);

// --- Các route còn lại ---
router.put('/status/:id', cinemaController.updateStatus);
router.delete('/:id', cinemaController.deleteCinema);

module.exports = router;