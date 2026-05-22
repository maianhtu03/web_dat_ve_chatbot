import axios from 'axios';

// Cấu hình URL cơ sở của Backend (thường khai báo trong file .env)
const API_URL = 'http://localhost:5000/api/customers';

const customerApi = {
    /**
     * Lấy danh sách khách hàng
     * @param {string} search - Từ khóa tìm kiếm (tên, email, mã thành viên)
     */
    getAllCustomers: async (search = '') => {
        try {
            const response = await axios.get(`${API_URL}?search=${search}`, {
                withCredentials: true // Gửi kèm cookie/token nếu có
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Không thể kết nối đến máy chủ' };
        }
    },

    /**
     * Cập nhật trạng thái hoạt động của khách hàng (Active/Banned)
     * @param {string|number} id - ID của người dùng
     * @param {number} currentStatus - Trạng thái hiện tại (1 hoặc 0)
     */
    updateStatus: async (id, currentStatus) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/status`, {
                is_active: currentStatus
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Lỗi khi cập nhật trạng thái' };
        }
    },

    /**
     * Cập nhật thông tin chi tiết hội viên
     * @param {string|number} id - ID của người dùng
     * @param {object} data - { tier_id, current_points }
     */
    updateCustomerInfo: async (id, data) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Lỗi khi cập nhật thông tin' };
        }
    }
};

export default customerApi;