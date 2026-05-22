import axios from 'axios';

// Khai báo Base URL - Lưu ý BE của bạn đang dùng số ít 'payment' trong router
const API_URL = 'http://localhost:5000/api/payment';

export const paymentApi = {
    /**
     * Bước 2: Gửi yêu cầu tạo URL thanh toán VNPAY sau khi đã có bookingId
     * @param {Object} paymentData - Bao gồm: amount, bookingId
     */
    createVnpayUrl: (paymentData) => {
        // Khớp với router.post('/create-url', ...) ở Backend
        return axios.post(`${API_URL}/create-url`, paymentData);
    },
    createMomoUrl: (data) => {
        // data bao gồm { amount, bookingId }
        return axios.post('http://localhost:5000/api/payment/momo/create-url', data);
    },
    /**
     * LƯU Ý QUAN TRỌNG: 
     * Hàm verifyReturn này thực tế sẽ KHÔNG cần gọi từ Frontend nữa 
     * vì Backend của bạn đã dùng res.redirect để đẩy thẳng về trang Success/Fail rồi.
     * Tuy nhiên bạn vẫn có thể giữ để lấy thông tin chi tiết đơn hàng nếu cần.
     */
    getPaymentStatus: (bookingId) => {
        return axios.get(`${API_URL}/vnpay-return`, {
            params: { vnp_TxnRef: bookingId }
        });
    }
};

export default paymentApi;