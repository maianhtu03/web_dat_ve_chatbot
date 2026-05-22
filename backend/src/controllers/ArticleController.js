const ArticleModel = require('../models/ArticleModel');
const ArticleService = require('../services/ArticleService');

const ArticleController = {
    getAllArticles: async (req, res) => {
        try {
            const data = await ArticleModel.getAll();
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getArticleById: async (req, res) => {
        try {
            const data = await ArticleModel.getById(req.params.id);
            if (!data) return res.status(404).json({ success: false, message: "Không tìm thấy" });
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    // ArticleController.js
    getArticleBySlug: async (req, res) => {
        try {
            const { slug } = req.params;
            // Gọi service để vừa lấy dữ liệu vừa tăng view luôn
            const data = await ArticleService.getDetailAndIncrementView(slug);

            if (!data) {
                return res.status(404).json({ success: false, message: "Không tìm thấy" });
            }
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createArticle: async (req, res) => {
        try {
            // Nếu có upload ảnh qua Multer, lấy tên file
            const thumbnail = req.file ? `/uploads/articles/${req.file.filename}` : null;
            const articleData = { ...req.body, thumbnail };

            await ArticleService.createNewArticle(articleData);
            res.json({ success: true, message: "Tạo bài viết thành công" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateArticle: async (req, res) => {
        try {
            const thumbnail = req.file ? `/uploads/articles/${req.file.filename}` : req.body.thumbnail;
            const articleData = { ...req.body, thumbnail };

            await ArticleService.updateArticle(req.params.id, articleData);
            res.json({ success: true, message: "Cập nhật thành công" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    deleteArticle: async (req, res) => {
        try {
            await ArticleModel.delete(req.params.id);
            res.json({ success: true, message: "Đã xóa bài viết" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    toggleStatus: async (req, res) => {
        try {
            await ArticleModel.updateStatus(req.params.id, req.body.status);
            res.json({ success: true, message: "Đã cập nhật trạng thái" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = ArticleController;