import axios from 'axios';

const API_URL = 'http://localhost:5000/api/articles';

const articleApi = {
    // Lấy tất cả bài viết
    getAll: () => axios.get(API_URL),

    // Lấy chi tiết 1 bài viết
    getById: (id) => axios.get(`${API_URL}/${id}`),
    getBySlug: (slug) => axios.get(`${API_URL}/slug/${slug}`),

    // Tạo bài viết mới (Sử dụng FormData vì có gửi ảnh)
    create: (formData) => axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Cập nhật bài viết
    update: (id, formData) => axios.put(`${API_URL}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Xóa bài viết
    delete: (id) => axios.delete(`${API_URL}/${id}`),

    // Cập nhật nhanh trạng thái (Ẩn/Hiện)
    toggleStatus: (id, status) => axios.patch(`${API_URL}/${id}/status`, { status })
};

export default articleApi;