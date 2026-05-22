import axios from 'axios';

const API_URL = 'http://localhost:5000/api/foods';

// Tạo một instance axios để cấu hình dùng chung
const api = axios.create({
    baseURL: API_URL
});

// Sử dụng Interceptors để tự động lấy .data từ axios response
api.interceptors.response.use(
    (response) => response.data, // Trả về thẳng { success: true, data: [...] }
    (error) => Promise.reject(error)
);

export const getFoods = () => api.get('/');
export const createFood = (foodData) => api.post('/add', foodData);
export const updateFood = (id, foodData) => api.put(`/${id}`, foodData);
export const updateFoodStatus = (id, status) => api.put(`/status/${id}`, { status });
export const deleteFood = (id) => api.delete(`/${id}`);

const foodApi = {
    getAll: getFoods,
    create: createFood,
    update: updateFood,
    updateStatus: updateFoodStatus,
    delete: deleteFood
};

export default foodApi;