import axios from 'axios';

// URL trỏ đúng vào route thống kê vận hành mà ta đã khai báo trong server.js
const API_URL = 'http://localhost:5000/api/statistics/operation';

const operationApi = {
    /**
     * Lấy báo cáo hiệu suất suất chiếu và phòng chiếu (cho bản đồ nhiệt)
     * Trả về dữ liệu bao gồm: sold_seats, empty_seats, occupancy_rate, status
     */
    getShowtimeEfficiency: async (params) => {
        try {
            const response = await axios.get(`${API_URL}/showtime-efficiency`, {
                params,
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching operation statistics:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách chi nhánh để lọc dữ liệu bản đồ
     */
    getBranches: async () => {
        try {
            // Lưu ý: Nếu bạn chưa viết route này trong OperationController, 
            // bạn có thể dùng chung api từ movieStatisticsApi
            const response = await axios.get(`${API_URL}/branches`);
            return response.data;
        } catch (error) {
            console.error("Error fetching branches:", error);
            return { success: false, data: [] };
        }
    },

    /**
     * Lấy danh sách rạp theo chi nhánh
     */
    getCinemas: async (branchId) => {
        try {
            const response = await axios.get(`${API_URL}/cinemas`, {
                params: { branchId }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching cinemas:", error);
            return { success: false, data: [] };
        }
    }
};

export default operationApi;