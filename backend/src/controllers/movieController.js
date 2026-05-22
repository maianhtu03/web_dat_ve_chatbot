const movieService = require('../services/movieService');

exports.getMoviesForAdmin = async (req, res) => {
    try {
        const { status } = req.query;
        const movies = await movieService.fetchMovies(status);
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createMovie = async (req, res) => {
    try {
        // req.body chứa các trường text (title, director, etc.)
        const movieData = req.body;

        // Nếu có file được upload, multer sẽ bỏ vào req.file
        if (req.file) {
            // Lưu đường dẫn ảnh vào database (khớp với thư mục static đã cấu hình)
            movieData.poster = `/uploads/posters/${req.file.filename}`;
        }

        const result = await movieService.addNewMovie(movieData);
        // PHÁT TÍN HIỆU: Có phim mới được tạo
        req.io.emit('movie_list_changed', { action: 'create', data: result });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMoviesForUser = async (req, res) => {
    try {
        // Chỉ lấy những phim đã xuất bản (Published)
        const movies = await movieService.fetchMovies('Published');
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Thêm hàm này vào cuối file movieController.js
exports.updateMovie = async (req, res) => {
    try {
        const { id } = req.params;
        // Đảm bảo movieData luôn là một object
        const movieData = { ...req.body };

        if (req.file) {
            movieData.poster = `/uploads/posters/${req.file.filename}`;
        }

        const result = await movieService.updateExistingMovie(id, movieData);
        // PHÁT TÍN HIỆU: Thông tin phim vừa được cập nhật
        req.io.emit('movie_list_changed', { action: 'update', id });

        res.status(200).json({
            message: "Cập nhật phim thành công!",
            data: result
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateMovieStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Gọi service để update riêng cột status
        const result = await movieService.updateStatus(id, status);
        // PHÁT TÍN HIỆU: Trạng thái ẩn/hiện thay đổi (User cần cập nhật lại danh sách)
        req.io.emit('movie_list_changed', { action: 'update_status', id, status });

        res.status(200).json({
            message: "Cập nhật trạng thái thành công!",
            data: result
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Hàm xóa phim
exports.deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;

        await movieService.removeMovie(id);
        // PHÁT TÍN HIỆU: Phim đã bị xóa
        req.io.emit('movie_list_changed', { action: 'delete', id });

        res.status(200).json({ message: "Xóa phim thành công!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMovieById = async (req, res) => {
    try {
        const { id } = req.params;
        const movie = await movieService.getMovieById(id);
        if (!movie) {
            return res.status(404).json({ message: "Không tìm thấy phim!" });
        }
        res.status(200).json(movie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getHotMovies = async (req, res) => {
    try {
        // Gọi service để lấy danh sách phim hot (is_hot = 1)
        // Bạn có thể truyền số lượng muốn lấy vào hàm, ví dụ: 5
        const movies = await movieService.fetchHotMovies(5);
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateMovieHot = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_hot } = req.body;

        // Phải khớp với tên hàm bên Service
        const result = await movieService.updateHotStatus(id, is_hot);
        // PHÁT TÍN HIỆU: Phim đổi trạng thái HOT
        req.io.emit('movie_list_changed', { action: 'update_hot', id, is_hot });
        res.status(200).json({
            message: "Cập nhật trạng thái HOT thành công!",
            data: result
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.searchMovies = async (req, res) => {
    try {
        // Lấy từ khóa từ query parameter: /api/movies/search?q=...
        const keyword = req.query.q || '';

        // Gọi service để lấy kết quả
        const movies = await movieService.searchMovies(keyword);

        // Trả về dữ liệu cho Frontend (bọc trong object có success để đồng bộ với axios gọi ở FE)
        res.status(200).json({
            success: true,
            data: movies
        });
    } catch (error) {
        // Trả về lỗi 500 nếu có vấn đề về Database hoặc Server
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};