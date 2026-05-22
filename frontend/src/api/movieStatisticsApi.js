import axios from 'axios';

// Đảm bảo URL này khớp với tiền tố bạn đặt trong server.js (ví dụ: app.use('/api/statistics/movie', movieRoute))
const API_URL = 'http://localhost:5000/api/statistics/movie';

const movieStatisticsApi = {
    /**
     * Lấy báo cáo thống kê phim tổng hợp
     */
    getMovieReport: async (params) => {
        try {
            const response = await axios.get(`${API_URL}/report`, {
                params,
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching movie statistics:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách chi nhánh
     * Sửa URL để trỏ đúng vào Route bạn vừa khai báo trong MovieStatisticsController
     */
    getBranches: async () => {
        try {
            // Thay vì dùng BASE_API, ta dùng chung API_URL vì bạn đã khai báo route này trong Controller thống kê
            const response = await axios.get(`${API_URL}/branches`);
            return response.data;
        } catch (error) {
            console.error("Error fetching branches:", error);
            return { success: false, data: [] };
        }
    },

    /**
     * Lấy danh sách rạp
     */
    getCinemas: async () => {
        try {
            const response = await axios.get(`${API_URL}/cinemas`);
            return response.data;
        } catch (error) {
            console.error("Error fetching cinemas:", error);
            return { success: false, data: [] };
        }
    }
};

export default movieStatisticsApi;