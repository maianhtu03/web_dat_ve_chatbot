import axios from 'axios';

// Cấu hình URL cơ sở (nên lấy từ file .env hoặc hằng số chung)
const API_URL = 'http://localhost:5000/api/statistics/tickets';

const ticketStatisticsApi = {
    /**
     * Lấy dữ liệu thống kê vé tổng hợp
     * @param {string} startDate - Định dạng YYYY-MM-DD
     * @param {string} endDate - Định dạng YYYY-MM-DD
     */
    getTicketReport: async (startDate, endDate, branchId, cinemaId) => {
        try {
            const response = await axios.get(`${API_URL}/tickets`, {
                params: { startDate, endDate, branchId, cinemaId },
                withCredentials: true // Quan trọng nếu có dùng cookie/session
            });

            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Không thể lấy dữ liệu thống kê');
        } catch (error) {
            console.error("Lỗi gọi API thống kê vé:", error);
            throw error;
        }
    },
    getBranches: async () => {
        try {
            const response = await axios.get(`${API_URL}/branches`, { withCredentials: true });
            return response.data.data;
        } catch (error) {
            console.error("Lỗi lấy danh sách chi nhánh:", error);
            return [];
        }
    },

    /**
     * 4. Bổ sung hàm lấy danh sách Rạp theo Chi nhánh cho Dropdown
     */
    getCinemas: async (branchId) => {
        try {
            const response = await axios.get(`${API_URL}/cinemas`, {
                params: { branchId },
                withCredentials: true
            });
            return response.data.data;
        } catch (error) {
            console.error("Lỗi lấy danh sách rạp:", error);
            return [];
        }
    }

    /**
     * Có thể thêm các hàm lấy lẻ nếu sau này Tú tách route BE
     */
    // getOccupancyOnly: async (startDate, endDate) => { ... }
};

export default ticketStatisticsApi;