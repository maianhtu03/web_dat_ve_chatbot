const customerModel = require('../models/customerModel');

const customerService = {
    /**
     * Lấy danh sách khách hàng
     * @param {string} search - Từ khóa tìm kiếm (fullName, email, member_code)
     */
    fetchCustomers: async (search) => {
        // Gọi model để lấy dữ liệu từ DB
        return await customerModel.findAll(search);
    },

    /**
     * Đảo ngược trạng thái hoạt động của tài khoản
     * @param {number|string} id - ID của người dùng
     * @param {number|string} currentStatus - Trạng thái hiện tại (1 hoặc 0)
     */
    toggleStatus: async (id, currentStatus) => {
        // Logic đảo trạng thái: 
        // Nếu đang là 1 (Hoạt động) -> Chuyển thành 0 (Khóa)
        // Nếu đang là 0 (Khóa) -> Chuyển thành 1 (Hoạt động)
        const newStatus = Number(currentStatus) === 1 ? 0 : 1;

        return await customerModel.updateActiveStatus(id, newStatus);
    },

    /**
     * Cập nhật thông tin chi tiết hội viên
     * @param {number|string} id - ID của người dùng (user_id)
     * @param {object} data - Dữ liệu cần cập nhật { rank_name, current_points }
     */
    updateCustomerDetails: async (id, data) => {
        const { rank_name, current_points } = data;

        // Kiểm tra logic nghiệp vụ (Tùy chọn):
        // Bạn có thể thêm logic tự động nâng hạng ở đây nếu muốn, ví dụ:
        // if (current_points >= 5000) rank_name = 'VVIP';
        // else if (current_points >= 1000) rank_name = 'VIP';

        // rank_name phải gửi lên đúng 1 trong 3 giá trị ENUM: 'Standard', 'VIP', 'VVIP'
        return await customerModel.updateMembershipData(id, rank_name, current_points);
    }
};

module.exports = customerService;