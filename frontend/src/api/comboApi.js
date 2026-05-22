import axios from 'axios';

const API_URL = 'http://localhost:5000/api/combos';

const api = axios.create({
    baseURL: API_URL
});

// Tự động trả về data để FE dùng luôn (e.g. res.success, res.data)
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// 1. Lấy danh sách combo
export const getCombos = () => api.get('/');

// 2. Thêm combo mới
export const createCombo = (formData) => api.post('/add', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// 3. Cập nhật combo (Sửa)
// Truyền cả id và formData (chứa info, items và file ảnh mới nếu có)
export const updateCombo = (id, formData) => api.put(`/update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// 4. Xóa combo
// Khớp với Route: router.delete('/delete/:id', ...)
export const deleteCombo = (id) => api.delete(`/delete/${id}`);

const comboApi = {
    getAll: getCombos,
    create: createCombo,
    update: updateCombo,
    delete: deleteCombo
};

export default comboApi;