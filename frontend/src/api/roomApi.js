import axios from 'axios';

const API_URL = 'http://localhost:5000/api/rooms';

// Thêm link lấy danh sách mẫu sơ đồ để dùng trong Form
const TEMPLATE_URL = 'http://localhost:5000/api/seat-templates';

/**
 * 1. Lấy danh sách tất cả phòng chiếu
 */
export const getRooms = () => {
    return axios.get(API_URL);
};

/**
 * 2. Thêm mới phòng chiếu
 * roomData giờ đây bao gồm cả template_id
 */
export const createRoom = (roomData) => {
    return axios.post(`${API_URL}/add`, roomData);
};

/**
 * 3. Cập nhật thông tin phòng chiếu
 */
export const updateRoom = (id, roomData) => {
    return axios.put(`${API_URL}/${id}`, roomData);
};

/**
 * 4. Cập nhật riêng trạng thái Hoạt động
 */
export const updateRoomStatus = (id, is_active) => {
    return axios.put(`${API_URL}/status/${id}`, { is_active });
};

/**
 * 5. Xóa phòng chiếu
 */
export const deleteRoom = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};

/**
 * 6. Lấy danh sách rạp theo chi nhánh
 */
export const getCinemasByBranch = (branchId) => {
    return axios.get(`${API_URL}/by-branch/${branchId}`);
};

/**
 * 7. MỚI: Lấy danh sách mẫu sơ đồ ghế
 * Hàm này giúp RoomForm lấy dữ liệu để đổ vào Dropdown mẫu sơ đồ
 */
export const getSeatTemplates = () => {
    return axios.get(TEMPLATE_URL);
};
export const getRoomsByCinema = (cinemaId) => {
    return axios.get(`${API_URL}/by-cinema/${cinemaId}`);
};
export const getRoomTypes = () => {
    return axios.get(`${API_URL}/types/all`); // Lưu ý: URL này phải khớp với Backend bạn viết
};