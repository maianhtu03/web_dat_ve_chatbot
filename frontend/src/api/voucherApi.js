import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/vouchers';

const voucherApi = {
    // Admin lấy tất cả voucher
    getAllVouchers: async () => {
        return await axios.get(`${BASE_URL}/admin/all`);
    },
    // 2. Admin lấy chi tiết 1 voucher để sửa (MỚI)
    getVoucherById: async (id) => {
        return await axios.get(`${BASE_URL}/admin/detail/${id}`);
    },
    // Admin tạo mới voucher
    createVoucher: async (data) => {
        return await axios.post(`${BASE_URL}/admin/create`, data);
    },
    updateVoucher: async (id, data) => {
        return await axios.put(`${BASE_URL}/admin/update/${id}`, data);
    },
    getMyVouchers: async (userId) => {
        // Đường dẫn này phải khớp với router.get('/my-vouchers/:userId', ...) ở Backend
        return await axios.get(`${BASE_URL}/my-vouchers/${userId}`);
    },
    // Áp dụng mã giảm giá khi đặt vé
    applyVoucher: async (data) => {
        return await axios.post(`${BASE_URL}/apply`, data);
    },
    // 5. Admin xóa voucher (MỚI)
    // Dùng phương thức DELETE để xóa
    deleteVoucher: async (id) => {
        return await axios.delete(`${BASE_URL}/admin/delete/${id}`);
    }
};

export default voucherApi;