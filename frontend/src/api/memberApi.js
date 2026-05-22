import axios from 'axios';

const API_URL = 'http://localhost:5000/api/memberships';

const memberApi = {
    /**
     * Lấy thông tin chi tiết thẻ thành viên theo userId
     */
    getMemberInfo: async (userId) => {
        try {
            const response = await axios.get(`${API_URL}/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy thông tin thành viên:", error);
            throw error.response?.data || { message: "Lỗi kết nối server" };
        }
    },
    getPointHistory: async (userId) => {
        try {
            const response = await axios.get(`${API_URL}/history/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi lấy lịch sử điểm:", error);
            throw error.response?.data;
        }
    },

    /**
     * Cập nhật chi tiêu và tích điểm sau khi thanh toán thành công
     */
    addTransaction: async (data) => {
        try {
            const response = await axios.post(`${API_URL}/add-transaction`, data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tích điểm:", error);
            throw error.response?.data || { message: "Lỗi tích điểm" };
        }
    },


    /**
     * (MỚI) Gọi lệnh kiểm tra và xử lý tụt hạng cho các thẻ hết hạn
     * Thường dùng ở trang Admin hoặc gọi tự động khi User đăng nhập
     */
    checkRankDemotion: async () => {
        try {
            const response = await axios.post(`${API_URL}/check-demotion`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi kiểm tra tụt hạng:", error);
            throw error.response?.data || { message: "Lỗi xử lý hạng thẻ" };
        }
    },

    /**
     * API đổi điểm
     */
    spendPoints: async (userId, points, description) => {
        try {
            const response = await axios.post(`${API_URL}/spend-points`, {
                userId,
                points,
                description
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi đổi điểm:", error);
            throw error.response?.data || { message: "Lỗi khi thực hiện đổi điểm" };
        }
    }
};

export default memberApi;