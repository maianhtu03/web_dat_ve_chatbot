const Banner = require('../models/bannerModel');

const bannerService = {
    findAll: async () => {
        return await Banner.getAll();
    },

    createBanners: async (bannersData) => {
        // Chuyển đổi object thành mảng các giá trị để phù hợp với Bulk Insert
        const values = bannersData.map(b => [
            b.title,
            b.image_url,
            b.link_type || 'none',
            b.target_id || null,
            b.external_url || null,
            b.status !== undefined ? b.status : 1,
            b.order_priority || 0
        ]);
        return await Banner.createBulk(values);
    },

    findById: async (id) => {
        const banner = await Banner.getById(id);
        return banner;
    },
    updateBanner: async (id, data) => {
        const existing = await Banner.getById(id);
        if (!existing) throw new Error("Không tìm thấy banner");

        // Ép kiểu status về số 1 hoặc 0 một cách nghiêm ngặt
        let finalStatus = existing.status; // Mặc định dùng lại cái cũ
        if (data.status !== undefined && data.status !== null) {
            // Nếu là 'active', 'true', true, hoặc 1 thì là 1, ngược lại là 0
            finalStatus = (data.status === 'active' || data.status === 'true' || data.status === true || data.status == 1) ? 1 : 0;
        }

        const updatedData = {
            title: data.title !== undefined ? data.title : existing.title,
            image_url: data.image_url !== undefined ? data.image_url : existing.image_url,
            link_type: data.link_type !== undefined ? data.link_type : existing.link_type,
            target_id: data.target_id !== undefined ? data.target_id : existing.target_id,
            external_url: data.external_url !== undefined ? data.external_url : existing.external_url,
            status: finalStatus, // Sử dụng giá trị đã được xử lý chuẩn
            order_priority: data.order_priority !== undefined ? data.order_priority : existing.order_priority
        };

        return await Banner.update(id, updatedData);
    },

    removeBanner: async (id) => {
        return await Banner.delete(id);
    }
};

module.exports = bannerService;