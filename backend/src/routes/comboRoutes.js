const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const comboController = require('../controllers/comboController');

// 1. Cấu hình lưu trữ ảnh Combo
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads/combos';
        // Tự động tạo thư mục nếu chưa có
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'combo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Bộ lọc ảnh (tùy chọn nhưng nên có để bảo mật)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file hình ảnh!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

// 2. Định nghĩa các Routes

// Lấy toàn bộ danh sách combo
router.get('/', comboController.getAll);

// Thêm combo mới (POST)
router.post('/add', upload.single('image'), comboController.createCombo);

// Cập nhật combo (PUT) - Cần truyền ID trên URL
// Sử dụng upload.single('image') để cho phép thay đổi ảnh khi sửa
router.put('/update/:id', upload.single('image'), comboController.updateCombo);

// Xóa combo (DELETE) - Cần truyền ID trên URL
// Lưu ý: Tên hàm trong controller là deleteCombo cho đồng bộ
router.delete('/delete/:id', comboController.deleteCombo);

module.exports = router;