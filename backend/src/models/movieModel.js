const db = require('../config/db');

// Lấy danh sách phim
// models/movieModel.js

// Lấy danh sách phim
exports.getAll = async (status) => {
    // Câu SQL này sẽ tạo thêm một cột 'early_show_count' 
    // bằng cách đếm các suất chiếu có ngày < ngày khởi chiếu của chính phim đó
    let sql = `
        SELECT m.*, 
        (SELECT COUNT(*) FROM showtimes s 
         WHERE s.movie_id = m.id 
         AND s.show_date < m.release_date) as early_show_count
        FROM movies m
    `;
    const params = [];

    if (status === 'Published') {
        sql += " WHERE m.status = 'Published' AND (m.end_date >= CURDATE() OR m.end_date IS NULL)";
        sql += ' ORDER BY m.release_date ASC';
    } else if (status) {
        sql += ' WHERE m.status = ?';
        params.push(status);
        sql += ' ORDER BY m.created_at DESC';
    } else {
        sql += ' ORDER BY m.created_at DESC';
    }

    const [rows] = await db.execute(sql, params);
    return rows;
};

// Thêm phim mới
exports.create = async (data) => {
    // 1. Thêm 'versions' vào danh sách cột và thêm một dấu '?'
    const sql = `INSERT INTO movies (title, director, actors, genre, rating, duration,language, description, poster, release_date, end_date, trailer_code, is_hot, status, versions) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
        data.title, data.director, data.actors, data.genre, data.rating,
        data.duration, data.language, data.description, data.poster, data.release_date,
        data.end_date, data.trailer_code, data.is_hot || 0, data.status || 'Published',
        data.versions
    ];
    const [result] = await db.execute(sql, params);
    return { id: result.insertId, ...data };
};

// Cập nhật toàn bộ thông tin phim
exports.update = async (id, data) => {
    const sql = `UPDATE movies SET 
        title = ?, director = ?, actors = ?, genre = ?, rating = ?, 
        duration = ?, language = ?, description = ?, poster = ?, release_date = ?, 
        end_date = ?, trailer_code = ?, is_hot = ?, status = ?,
        versions = ? 
        WHERE id = ?`;

    const params = [
        data.title, data.director, data.actors, data.genre, data.rating,
        data.duration, data.language, data.description, data.poster, data.release_date,
        data.end_date, data.trailer_code, data.is_hot, data.status, data.versions, id
    ];

    const [result] = await db.execute(sql, params);
    return result;
};

// --- HÀM QUAN TRỌNG ĐỂ SỬA LỖI 500 ---
exports.updateStatus = async (id, status) => {
    const sql = 'UPDATE movies SET status = ? WHERE id = ?';
    const [result] = await db.execute(sql, [status, id]);
    return result;
};

// Xóa phim
exports.delete = async (id) => {
    const sql = 'DELETE FROM movies WHERE id = ?';
    const [result] = await db.execute(sql, [id]);
    return result;
};

exports.getById = async (id) => {
    const sql = 'SELECT * FROM movies WHERE id = ?';
    const [rows] = await db.execute(sql, [id]);
    return rows[0]; // Trả về đối tượng đầu tiên tìm thấy
};
exports.updateHot = async (id, is_hot) => {
    const sql = 'UPDATE movies SET is_hot = ? WHERE id = ?';
    const [result] = await db.execute(sql, [is_hot, id]);
    return result;
};
/**
 * Lấy danh sách phim Hot từ database
 * @param {number} limit - Số lượng phim muốn lấy (mặc định là 5)
 */
exports.getHot = async (limit = 5) => {
    // Câu lệnh SQL lọc phim theo is_hot = 1 và status = 'Published'
    // Sắp xếp theo ngày tạo mới nhất (hoặc ngày phát hành)
    const sql = `
        SELECT id, title, genre, poster as image_url 
        FROM movies 
        WHERE is_hot = 1 AND status = 'Published' 
        ORDER BY created_at DESC 
        LIMIT ?
    `;

    // Lưu ý: limit trong MySQL phải là kiểu số, db.execute nhận params là array
    const [rows] = await db.execute(sql, [limit.toString()]);
    return rows;
};
exports.search = async (keyword) => {
    try {
        // Chỉ tìm những phim có trạng thái là 'Published'
        // Sử dụng LIKE %keyword% để tìm kiếm tương đối
        const sql = `
            SELECT id, title, poster, duration, genre 
            FROM movies 
            WHERE title LIKE ? AND status = 'Published'
            LIMIT 10
        `;

        // params sẽ là %tên_phim%
        const [rows] = await db.execute(sql, [`%${keyword}%`]);
        return rows;
    } catch (error) {
        throw error;
    }
};