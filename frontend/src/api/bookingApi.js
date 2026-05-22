// src/api/bookingApi.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/bookings';

export const bookingApi = {
    createBooking: (bookingData) => {
        return axios.post(`${API_URL}/create`, bookingData);
    },
    // 2. LẤY LỊCH SỬ ĐẶT VÉ THEO USER ID (Quan trọng nhất cho trang lịch sử)
    // Backend cần route: GET /api/bookings/user/:userId
    getBookingsByUserId: (userId) => {
        return axios.get(`${API_URL}/user/${userId}`);
    },

    // 3. Lấy chi tiết một đơn hàng cụ thể (nếu cần xem vé điện tử)
    // Backend cần route: GET /api/bookings/:id
    getBookingById: (id) => {
        return axios.get(`${API_URL}/${id}`);
    },

    // 4. Cập nhật trạng thái thanh toán (Thường gọi sau khi thanh toán VNPay/Momo xong)
    // Backend cần route: PUT /api/bookings/update-status/:id
    updatePaymentStatus: (id, status) => {
        return axios.put(`${API_URL}/update-status/${id}`, { payment_status: status });
    }
};