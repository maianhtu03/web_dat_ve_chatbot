const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Cấu hình lưu trữ ảnh cho đồ ăn
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads/foods';
        // Tự động tạo thư mục nếu chưa tồn tại để tránh lỗi crash server
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Tạo tên file duy nhất: timestamp-random-tên_gốc
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'food-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Kiểm tra định dạng file (Chỉ cho phép ảnh)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file hình ảnh! (jpg, png, webp...)'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

// --- NHÓM ROUTE LẤY DỮ LIỆU (GET) ---
router.get('/', foodController.getAllFoods);

// --- NHÓM ROUTE THÊM MỚI (POST) ---
// Field name 'image' phải khớp với FormData bên React
router.post('/add', upload.single('image'), foodController.addFood);

// --- NHÓM ROUTE CẬP NHẬT (PUT) ---
// Cập nhật thông tin đồ ăn (có thể có ảnh mới hoặc không)
router.put('/:id', upload.single('image'), foodController.updateFood);

// Cập nhật riêng trạng thái (Hoạt động/Ngừng kinh doanh) - Dùng cho nút Switch ở Table
router.put('/:id/status', foodController.updateFoodStatus);

// --- NHÓM ROUTE XÓA (DELETE) ---
router.delete('/:id', foodController.deleteFood);

module.exports = router;