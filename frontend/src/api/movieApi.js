import axios from 'axios';

// Khai báo Base URL từ file .env hoặc mặc định
const API_URL = 'http://localhost:5000/api/movies';

export const movieApi = {
    /**
     * Lấy danh sách phim cho Admin (Có thể lọc theo status)
     *
     */

    /**
     * Tìm kiếm phim theo tiêu đề (Dành cho Search Suggestion)
     * @param {string} keyword - Từ khóa tìm kiếm
     */
    searchMovies: (keyword) => {
        return axios.get(`${API_URL}/search`, {
            params: { q: keyword }
        });
    },
    getAllUser: () => {
        return axios.get(`${API_URL}`);
    },

    getAllAdmin: (status = '') => {
        return axios.get(`${API_URL}/admin`, {
            params: { status }
        });
    },

    /**
     * Lấy chi tiết 1 bộ phim theo ID (Dùng khi Sửa phim)
     */
    getById: (id) => {
        return axios.get(`${API_URL}/${id}`);
    },

    getMovieById: (id) => {
        return axios.get(`${API_URL}/${id}`);
    },
    /**
     * Thêm mới phim
     */
    create: (movieData) => {
        return axios.post(`${API_URL}/admin`, movieData, {
            headers: {
                'Content-Type': 'multipart/form-data' // <--- THÊM DÒNG NÀY
            }
        });
    },

    /**
     * Cập nhật thông tin phim
     */
    update: (id, movieData) => {
        return axios.put(`${API_URL}/admin/${id}`, movieData, {
            headers: {
                'Content-Type': 'multipart/form-data' // <--- THÊM DÒNG NÀY
            }
        });
    },

    /**
     * Xóa phim
     */
    delete: (id) => {
        return axios.delete(`${API_URL}/admin/${id}`);
    },

    /**
     * Cập nhật nhanh trạng thái (Published/Draft)
     * Dùng cho component MovieStatusSwitch
     */
    updateStatus: (id, statusData) => {
        // Đảm bảo đường dẫn này khớp 100% với Route bên Backend (Node.js)
        return axios.put(`${API_URL}/admin/${id}/status`, statusData);

    },

    updateHot: (id, hotData) => {
        return axios.put(`${API_URL}/admin/${id}/hot`, hotData);
    },
    getHotMovies: () => {
        return axios.get(`${API_URL}/hot`);
    },
    getShowtimes: (params) => {
        // Gọi đến route: http://localhost:5000/api/showtimes (Giả sử route chính là /api/showtimes)
        // Bạn hãy kiểm tra xem URL base của showtimes là gì nhé
        return axios.get('http://localhost:5000/api/showtimes', { params });
    },
};

export default movieApi;