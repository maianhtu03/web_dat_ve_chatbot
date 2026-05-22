import axios from 'axios';

const API_URL = 'http://localhost:5000/api/cinemas';

// Giữ nguyên các export const để các component cũ không bị lỗi
export const getCinemas = () => {
    return axios.get(API_URL);
};

export const createCinema = (cinemaData) => {
    return axios.post(`${API_URL}/add`, cinemaData);
};

export const updateCinema = (id, cinemaData) => {
    return axios.put(`${API_URL}/${id}`, cinemaData);
};

export const updateCinemaStatus = (id, is_active) => {
    return axios.put(`${API_URL}/status/${id}`, { is_active });
};

export const deleteCinema = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};

export const getCinemasByBranch = (branchId) => {
    return axios.get(`${API_URL}/branch/${branchId}`);
};

/**
 * THÊM PHẦN NÀY: Export default để TicketPriceList.jsx dùng được
 * Chúng ta trỏ các hàm vào một object chung
 */
const cinemaApi = {
    getAll: getCinemas, // Trỏ 'getAll' về hàm 'getCinemas' của bạn
    create: createCinema,
    update: updateCinema,
    updateStatus: updateCinemaStatus,
    delete: deleteCinema,
    getByBranch: getCinemasByBranch
};

export default cinemaApi;