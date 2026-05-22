import axios from 'axios';

// URL cơ sở khớp với cấu trúc Router Backend
const API_URL = 'http://localhost:5000/api/statistics/food';

const foodStatisticsApi = {
    /**
     * Lấy dữ liệu báo cáo thống kê
     */
    getFoodReport: async (startDate, endDate, branchId, cinemaId) => {
        try {
            // Sửa từ /food thành /report cho đúng router backend
            const response = await axios.get(`${API_URL}/report`, {
                params: {
                    startDate,
                    endDate,
                    branchId: branchId || 'all',
                    cinemaId: cinemaId || 'all'
                },
                withCredentials: true
            });
            // Trả về toàn bộ response.data để Frontend check được .success
            return response.data;
        } catch (error) {
            console.error("Lỗi gọi API thống kê đồ ăn:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách chi nhánh phục vụ bộ lọc (HÀM MỚI THÊM)
     */
    getBranches: async () => {
        try {
            const response = await axios.get(`${API_URL}/branches`, { withCredentials: true });
            return response.data;
        } catch (error) {
            console.error("Lỗi lấy danh sách chi nhánh:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách rạp theo chi nhánh phục vụ bộ lọc (HÀM MỚI THÊM)
     */
    getCinemas: async (branchId) => {
        try {
            const response = await axios.get(`${API_URL}/cinemas`, {
                params: { branchId: branchId || 'all' },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi lấy danh sách rạp:", error);
            throw error;
        }
    }
};

export default foodStatisticsApi;