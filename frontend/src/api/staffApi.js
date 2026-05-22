import axios from 'axios';

// Tạo một instance axios riêng để dễ quản lý cấu hình chung
const api = axios.create({
    baseURL: 'http://localhost:5000/api/staff',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Thêm interceptor để xử lý phản hồi, giúp lấy data trực tiếp và bắt lỗi tập trung
api.interceptors.response.use(
    (response) => response.data, // Trả về data luôn, ở Component không cần dùng .data nữa
    (error) => {
        // Log lỗi chi tiết từ Backend (cái error.message chúng ta đã sửa ở Controller)
        const message = error.response?.data?.message || "Lỗi hệ thống";
        console.error("API Error:", message);
        return Promise.reject(message);
    }
);

const staffApi = {
    // 1. Lấy danh sách nhân viên
    getAllStaffs: () => {
        return api.get('/');
    },

    // 2. Tạo tài khoản nhân viên mới
    // Đảm bảo staffData truyền vào có trường 'cinema_id' khớp với DB
    createStaff: (staffData) => {
        return api.post('/', staffData);
    },

    // 3. Xóa nhân viên theo ID
    deleteStaff: (id) => {
        return api.delete(`/${id}`);
    },

    // 4. Lấy danh sách rạp cho Dropdown (Fix lỗi 404)
    getCinemasList: () => {
        return api.get('/cinemas');
    },
    getStaffPermissions: (userId) => {
        return api.get(`/${userId}/permissions`);
    },

    // 5. Lấy toàn bộ danh mục quyền (Checkbox list)
    getPermissions: () => {
        return api.get('/permissions');
    },

    // 6. Gán quyền cho nhân viên
    assignPermissions: (userId, permissionIds) => {
        return api.post('/permissions/assign', {
            userId: Number(userId), // Đảm bảo ID là kiểu số
            permissionIds
        });
    }
};

export default staffApi;