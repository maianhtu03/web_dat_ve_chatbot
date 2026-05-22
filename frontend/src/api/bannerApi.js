import axios from 'axios';

// Đường dẫn cơ sở của API (thay đổi port nếu cần)
const API_URL = 'http://localhost:5000/api/banners';

const bannerApi = {
    /**
     * Lấy danh sách tất cả banner
     */
    getAllBanners: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Thêm mới danh sách banner (Xử lý nhiều ảnh cùng lúc)
     * @param {Object} mainData - Bao gồm title, status, description
     * @param {Array} imageRows - Mảng các hàng ảnh chứa file và linkType, targetId...
     */
    addBanners: async (mainData, imageRows) => {
        try {
            const formData = new FormData();

            // 1. Gửi các thông tin chung của đợt upload này
            formData.append('title', mainData.title);
            formData.append('status', mainData.status);
            formData.append('description', mainData.description);

            // 2. Chuẩn bị mảng metadata (link_type, target_id, external_url) cho từng ảnh
            // Vì FormData không nhận mảng object, ta phải chuyển sang chuỗi JSON
            const metaData = imageRows.map(row => ({
                linkType: row.linkType || 'none',
                targetId: row.targetId || null,
                externalUrl: row.externalUrl || null
            }));
            formData.append('data', JSON.stringify(metaData));

            // 3. Đẩy các file vật lý vào FormData
            // Lưu ý: Field name 'images' phải khớp với upload.array('images') ở Backend
            imageRows.forEach((row) => {
                if (row.file) {
                    formData.append('images', row.file);
                }
            });

            // 4. Gọi API với header multipart/form-data
            const response = await axios.post(`${API_URL}/add`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Cập nhật trạng thái bật/tắt của banner
     */
    updateStatus: async (id, status) => {
        try {
            const response = await axios.put(`${API_URL}/${id}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    getBannerById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    updateBanner: async (id, formData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Xóa banner theo ID
     */
    deleteBanner: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default bannerApi;