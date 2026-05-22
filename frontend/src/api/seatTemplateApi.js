import axios from 'axios';
const API_URL = 'http://localhost:5000/api/seat-templates';

// 1. Lấy danh sách toàn bộ mẫu
export const getTemplates = () => axios.get(API_URL);

// 2. Lấy chi tiết 1 mẫu
export const getTemplateDetail = (id) => axios.get(`${API_URL}/${id}`);

// 3. Thêm mới mẫu - SỬA: Bỏ /add vì Router BE dùng router.post('/')
export const createTemplate = (data) => axios.post(`${API_URL}`, data);

// 4. Cập nhật thông tin mẫu - SỬA: Bỏ /update vì Router BE dùng router.put('/:id')
export const updateTemplateInfo = (id, data) => axios.put(`${API_URL}/${id}`, data);

// 5. Cập nhật trạng thái - SỬA: Dùng PATCH và đúng cấu trúc /:id/status
export const updateTemplateStatus = (id, is_active) =>
    axios.patch(`${API_URL}/${id}/status`, { is_active });

// 6. Xóa mẫu
export const deleteTemplate = (id) => axios.delete(`${API_URL}/${id}`);

// 7. Cập nhật từng ghế (Giữ nguyên vì đã khớp)
export const updateSingleSeat = (seatId, data) => axios.put(`${API_URL}/seats/${seatId}`, data);