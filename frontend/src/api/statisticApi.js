import axios from 'axios';

const API_URL = 'http://localhost:5000/api/statistic';

const statisticApi = {
    /**
     * Lấy dữ liệu tổng quan Dashboard với đầy đủ bộ lọc
     * params: { branchId, cinemaId, startDate, endDate }
     */
    getOverview: async (filters) => {
        try {
            // Truyền object filters vào params để axios tự động tạo query string:
            // ?branchId=...&cinemaId=...&startDate=...&endDate=...
            const response = await axios.get(`${API_URL}/overview`, {
                params: filters
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi gọi API Overview:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách Chi nhánh để đổ vào Dropdown lọc 1
     */
    getBranches: async () => {
        try {
            const response = await axios.get(`${API_URL}/branches`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách chi nhánh:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách Rạp theo chi nhánh để đổ vào Dropdown lọc 2
     * @param {string|number} branchId 
     */
    getCinemas: async (branchId) => {
        try {
            const response = await axios.get(`${API_URL}/cinemas/${branchId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách rạp:", error);
            throw error;
        }
    },

    // Giữ nguyên hoặc gộp vào getOverview nếu Tú muốn
    getRevenueReport: async (startDate, endDate) => {
        try {
            const response = await axios.get(`${API_URL}/revenue`, {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi gọi API Revenue Report:", error);
            throw error;
        }
    }
};

export default statisticApi;