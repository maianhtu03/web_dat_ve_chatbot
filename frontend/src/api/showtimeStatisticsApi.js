import axios from 'axios';

const API_URL = 'http://localhost:5000/api/statistics/showtimes';

const showtimeStatisticsApi = {
    /**
     * Lấy báo cáo thống kê suất chiếu tổng hợp (KPI, Heatmap, Hiệu suất...)
     */
    getShowtimeReport: async (params) => {
        try {
            const response = await axios.get(`${API_URL}/report`, {
                params,
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching showtime statistics:", error);
            throw error;
        }
    },

    /**
     * Lấy dữ liệu mồi cho bộ lọc (Bao gồm cả Chi nhánh và Rạp)
     * Khớp với ShowtimeStatisticsController.getFilters và router.get('/filters')
     */
    getFilterMetadata: async () => {
        try {
            const response = await axios.get(`${API_URL}/filters`, {
                withCredentials: true
            });
            return response.data; // Trả về { success: true, data: { branches: [], cinemas: [] } }
        } catch (error) {
            console.error("Error fetching filter metadata:", error);
            return { success: false, data: { branches: [], cinemas: [] } };
        }
    }
};

export default showtimeStatisticsApi;