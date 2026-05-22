import axios from 'axios';

const API_URL = 'http://localhost:5000/api/revenue';

const revenueApi = {
    /**
     * 1. Lấy báo cáo doanh thu chi tiết (đã có)
     */
    getReport: async (startDate, endDate, branchId, cinemaId) => {
        try {
            const response = await axios.get(`${API_URL}/report`, {
                params: {
                    startDate,
                    endDate,
                    branchId: branchId || undefined,
                    cinemaId: cinemaId || undefined
                }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi gọi API Báo cáo doanh thu:", error);
            throw error;
        }
    },

    /**
     * 2. Lấy danh sách Chi nhánh (MỚI)
     * Dùng để hiện danh sách ở ô lọc Chi nhánh
     */
    getBranches: async () => {
        try {
            const response = await axios.get(`${API_URL}/branches`);
            return response.data; // Trả về { success: true, data: [...] }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách chi nhánh:", error);
            throw error;
        }
    },

    /**
     * 3. Lấy danh sách Rạp theo Chi nhánh (MỚI)
     * Dùng để cập nhật ô lọc Rạp khi chọn Chi nhánh
     */
    getCinemas: async (branchId) => {
        try {
            const response = await axios.get(`${API_URL}/cinemas/${branchId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách rạp:", error);
            throw error;
        }
    }
};

export default revenueApi;