const ArticleModel = require('../models/ArticleModel');

const ArticleService = {
    // Hàm tạo slug (Giữ nguyên của bạn)
    generateSlug: (title) => {
        return title
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/([^0-9a-z-\s])/g, '')
            .replace(/(\s+)/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    createNewArticle: async (data) => {
        let slug = data.slug || ArticleService.generateSlug(data.title);

        // --- LOGIC BỔ SUNG: Kiểm tra trùng lặp slug ---
        // Nếu trùng, thêm timestamp hoặc số ngẫu nhiên để đảm bảo duy nhất
        const existing = await ArticleModel.getBySlug(slug);
        if (existing) {
            slug = `${slug}-${Date.now()}`;
        }

        data.slug = slug;
        return await ArticleModel.create(data);
    },

    updateArticle: async (id, data) => {
        // Khi update, nếu tiêu đề thay đổi thì có thể tạo lại slug mới 
        // hoặc giữ nguyên slug cũ (tùy bạn, thường nên giữ nguyên để tốt cho SEO)
        if (!data.slug && data.title) {
            data.slug = ArticleService.generateSlug(data.title);
        }
        return await ArticleModel.update(id, data);
    },

    // --- HÀM MỚI: Lấy chi tiết và tự động tăng lượt xem ---
    getDetailAndIncrementView: async (slug) => {
        const article = await ArticleModel.getBySlug(slug);
        if (article) {
            // Tăng view ngầm, không cần đợi (không dùng await ở đây để load trang nhanh hơn)
            ArticleModel.incrementViews(article.id).catch(err => console.error("Lỗi tăng view:", err));
        }
        return article;
    }
};

module.exports = ArticleService;