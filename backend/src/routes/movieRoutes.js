const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const multer = require('multer');
const path = require('path');

// 1. Cấu hình lưu trữ ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Đảm bảo thư mục này đã tồn tại: public/uploads/posters
        cb(null, 'public/uploads/posters');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- NHÓM ROUTE LẤY DỮ LIỆU (GET) ---
// Phải để /admin lên TRƯỚC /:id để tránh bị nhầm lẫn
router.get('/search', movieController.searchMovies);
router.get('/admin', movieController.getMoviesForAdmin);
router.get('/', movieController.getMoviesForUser);
router.get('/hot', movieController.getHotMovies);
router.get('/:id', movieController.getMovieById);
// --- NHÓM ROUTE THÊM MỚI (POST) ---
// Sử dụng upload.single('poster') để nhận file từ form-data
router.post('/admin', upload.single('poster'), movieController.createMovie);

// --- NHÓM ROUTE CẬP NHẬT (PUT) ---
// Cập nhật toàn bộ thông tin phim (có thể có ảnh mới)
router.put('/admin/:id', upload.single('poster'), movieController.updateMovie);

// Cập nhật riêng trạng thái (Ẩn/Hiện) - Không cần multer vì chỉ gửi text/json
router.put('/admin/:id/status', movieController.updateMovieStatus);
router.put('/admin/:id/hot', movieController.updateMovieHot);

// --- NHÓM ROUTE XÓA (DELETE) ---
router.delete('/admin/:id', movieController.deleteMovie);

module.exports = router;