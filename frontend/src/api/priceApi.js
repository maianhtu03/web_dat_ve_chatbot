import axios from 'axios';

// Khai báo Base URL - Đảm bảo khớp với cổng Node.js của bạn
const API_URL = 'http://localhost:5000/api/prices';

export const priceApi = {
    /**
     * Lấy cấu hình giá sàn và phụ thu của một rạp
     * Thường dùng khi Load lại bảng giá hoặc khi đổi Cinema Select
     */
    getByCinemaId: (cinemaId) => {
        return axios.get(`${API_URL}/cinema/${cinemaId}`);
    },

    /**
     * Lưu toàn bộ cấu hình (Ma trận giá sàn + Danh sách biến động)
     * Dùng cho nút "LƯU TOÀN BỘ THÔNG TIN"
     */
    saveFullConfig: (data) => {
        return axios.post(`${API_URL}/save-all`, data);
    },

    /**
     * Cập nhật chỉ số tiền của Ma trận giá sàn (Base Prices)
     */
    updateBaseMatrix: (cinemaId, matrixData) => {
        return axios.put(`${API_URL}/admin/base-matrix/${cinemaId}`, matrixData);
    },

    /**
     * Thêm mới danh sách các quy tắc phụ thu
     * (Hỗ trợ gửi mảng nhiều mục từ PriceForm)
     */
    createSurcharges: (surchargeData) => {
        return axios.post(`${API_URL}/admin/surcharges`, surchargeData);
    },

    /**
     * Xóa một quy tắc phụ thu cụ thể
     */
    deleteSurcharge: (id) => {
        return axios.delete(`${API_URL}/admin/surcharges/${id}`);
    },

    /**
     * Cập nhật trạng thái áp dụng của biến động (ví dụ: Tạm ngưng phụ thu Tết)
     */
    updateSurchargeStatus: (id, statusData) => {
        return axios.put(`${API_URL}/admin/surcharges/${id}/status`, statusData);
    },

    /**
     * Lấy danh sách tất cả các cấu hình giá đã tồn tại
     */
    getAllConfigs: () => {
        return axios.get(`${API_URL}/configs`);
    },

    /**
     * Xóa toàn bộ cấu hình giá của một rạp (Cả giá sàn và phụ thu)
     */
    deleteFullConfig: (cinemaId) => {
        return axios.delete(`${API_URL}/cinema/${cinemaId}/all`);
    },

    /**
     * [MỚI] Lấy giá sàn thời gian thực dựa trên suất chiếu
     * Giúp hệ thống tự động nhận diện Thứ 2-6 (45k), Thứ 7-CN (55k) hoặc Ngày lễ (80k)
     * @param {string} cinemaId - ID rạp
     * @param {string} showtimeDate - Ngày giờ suất chiếu (định dạng ISO hoặc YYYY-MM-DD)
     */
    getCurrentBasePrice: (cinemaId, showtimeDate) => {
        return axios.get(`${API_URL}/cinema/${cinemaId}/current`, {
            params: { showtimeDate }
        });
    }
};

export default priceApi;