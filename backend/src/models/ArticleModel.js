const db = require('../config/db');

const ArticleModel = {

    getAll: async () => {
        const query = `
            SELECT a.*, u.fullName as author_name 
            FROM articles a 
            LEFT JOIN users u ON a.author_id = u.id 
            ORDER BY a.created_at DESC`; // ĐÃ SỬA: createdAt -> created_at cho khớp DB
        const [rows] = await db.query(query);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM articles WHERE id = ?', [id]);
        return rows[0];
    },
    getBySlug: async (slug) => {
        const query = `
            SELECT a.*, u.fullName as author_name 
            FROM articles a 
            LEFT JOIN users u ON a.author_id = u.id 
            WHERE a.slug = ?`;
        const [rows] = await db.query(query, [slug]);
        return rows[0]; // Trả về bài viết duy nhất
    },
    incrementViewsBySlug: async (slug) => {
        return await db.query('UPDATE articles SET views = views + 1 WHERE slug = ?', [slug]);
    },

    create: async (data) => {
        const { title, slug, short_description, content, thumbnail, author_id, status } = data;
        const query = `INSERT INTO articles (title, slug, short_description, content, thumbnail, author_id, status) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)`;
        // Đảm bảo các biến này không bị undefined khi truyền vào
        const [result] = await db.query(query, [
            title || null,
            slug || null,
            short_description || null,
            content || null,
            thumbnail || null,
            author_id || null,
            status ?? 1
        ]);
        return result.insertId;
    },

    update: async (id, data) => {
        const { title, slug, short_description, content, thumbnail, status } = data;
        const query = `UPDATE articles SET title=?, slug=?, short_description=?, content=?, thumbnail=?, status=? 
                       WHERE id=?`;
        return await db.query(query, [title, slug, short_description, content, thumbnail, status, id]);
    },

    delete: async (id) => {
        return await db.query('DELETE FROM articles WHERE id = ?', [id]);
    },

    updateStatus: async (id, status) => {
        return await db.query('UPDATE articles SET status = ? WHERE id = ?', [status, id]);
    },

    incrementViews: async (id) => {
        return await db.query('UPDATE articles SET views = views + 1 WHERE id = ?', [id]);
    }
};

module.exports = ArticleModel;