const movieModel = require('../models/movieModel');

exports.fetchMovies = async (status) => {
    // Bạn có thể xử lý thêm logic phân trang ở đây nếu cần
    return await movieModel.getAll(status);
};

exports.addNewMovie = async (movieData) => {
    // Ví dụ: Kiểm tra nếu trailer_code là link Youtube đầy đủ thì cắt lấy ID
    if (movieData.trailer_code && movieData.trailer_code.includes('v=')) {
        movieData.trailer_code = movieData.trailer_code.split('v=')[1].split('&')[0];
    }
    return await movieModel.create(movieData);
};
// Thêm vào src/services/movieService.js
exports.updateExistingMovie = async (id, movieData) => {
    // Bạn có thể thêm logic kiểm tra dữ liệu hoặc xử lý trailer_code ở đây
    if (movieData.trailer_code && movieData.trailer_code.includes('v=')) {
        movieData.trailer_code = movieData.trailer_code.split('v=')[1].split('&')[0];
    }
    return await movieModel.update(id, movieData);
};

exports.updateStatus = async (id, status) => {
    // Gọi đến model để update duy nhất cột status
    return await movieModel.updateStatus(id, status);
};

/**
 * Xóa phim khỏi hệ thống
 */
exports.removeMovie = async (id) => {
    return await movieModel.delete(id);
};

exports.getMovieById = async (id) => {
    return await movieModel.getById(id);
};

exports.updateHotStatus = async (id, is_hot) => {
    // Gọi đến hàm updateHot chuyên biệt vừa tạo ở trên
    return await movieModel.updateHot(id, is_hot);
};
/**
 * Lấy danh sách phim Hot (is_hot = 1)
 * @param {number} limit - Số lượng phim muốn lấy
 */
exports.fetchHotMovies = async (limit = 5) => {
    // Gọi đến model để truy vấn các phim có is_hot = 1
    // Thông thường chúng ta chỉ lấy những phim đang ở trạng thái 'Published'
    return await movieModel.getHot(limit);
};
/**
 * Tìm kiếm phim theo từ khóa tiêu đề
 * @param {string} keyword - Từ khóa người dùng nhập từ thanh search
 */
exports.searchMovies = async (keyword) => {
    // 1. Kiểm tra nếu keyword rỗng thì trả về mảng trống luôn để đỡ tốn tài nguyên gọi Model
    if (!keyword || keyword.trim() === '') {
        return [];
    }

    // 2. Có thể xử lý thêm logic như: chuyển keyword về viết thường, 
    // hoặc loại bỏ các ký tự đặc biệt nếu cần.
    const cleanKeyword = keyword.trim();

    // 3. Gọi đến hàm search trong movieModel mà bạn vừa thêm lúc nãy
    return await movieModel.search(cleanKeyword);
};