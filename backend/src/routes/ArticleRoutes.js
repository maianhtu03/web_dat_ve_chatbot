const express = require('express');
const router = express.Router();
const ArticleController = require('../controllers/ArticleController');
const multer = require('multer');
const path = require('path');

// Cấu hình upload ảnh
const storage = multer.diskStorage({
    destination: 'public/uploads/articles/',
    filename: (req, file, cb) => {
        cb(null, `article-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// Các Endpoint API
router.get('/', ArticleController.getAllArticles);
router.get('/slug/:slug', ArticleController.getArticleBySlug);
router.get('/:id', ArticleController.getArticleById);
router.post('/', upload.single('image'), ArticleController.createArticle);
router.put('/:id', upload.single('image'), ArticleController.updateArticle);
router.delete('/:id', ArticleController.deleteArticle);
router.patch('/:id/status', ArticleController.toggleStatus);

module.exports = router;