const bannerService = require('../services/bannerService');

const bannerController = {
    getAllBanners: async (req, res) => {
        try {
            const data = await bannerService.findAll();
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getBannerById: async (req, res) => {
        try {
            const { id } = req.params;
            // Gọi service để tìm banner theo ID
            const banner = await bannerService.findById(id);

            if (!banner) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy banner này"
                });
            }

            res.status(200).json({
                success: true,
                data: banner
            });
        } catch (error) {
            console.error("Lỗi getBannerById:", error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    addBanners: async (req, res) => {
        try {
            const files = req.files; // Multer array
            const { title, status, data } = req.body;

            // Dữ liệu link_type, target_id được gửi dưới dạng chuỗi JSON mảng
            const rowConfigs = JSON.parse(data);

            if (!files || files.length === 0) {
                return res.status(400).json({ success: false, message: "Vui lòng chọn ảnh" });
            }

            // Kết hợp file vật lý và thông tin cấu hình từ FE
            const bannersToSave = rowConfigs.map((config, index) => {
                // Logic mới: Chỉ parse nếu là phim/đồ ăn, còn lại giữ nguyên chuỗi
                let finalTargetId = config.targetId;
                if (config.linkType === 'movie' || config.linkType === 'food') {
                    const parsed = parseInt(config.targetId, 10);
                    finalTargetId = isNaN(parsed) ? null : parsed;
                }

                return {
                    title: title,
                    image_url: `/uploads/banners/${files[index].filename}`,
                    link_type: config.linkType,
                    target_id: finalTargetId, // Giá trị an toàn (Số, Chuỗi hoặc Null)
                    external_url: config.externalUrl,
                    status: status === 'true' || status === 1 ? 1 : 0,
                    order_priority: index
                };
            });
            await bannerService.createBanners(bannersToSave);
            res.status(201).json({ success: true, message: "Thêm danh sách banner thành công" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { id } = req.params;
            let { status } = req.body;

            // Ép kiểu về Number: 1 hoặc 0
            // Nếu FE gửi true/false, "true"/"false", 1/0 thì đều chuyển về 1 hoặc 0
            const updatedStatus = (status === true || status === 'true' || status == 1 || status === 'active') ? 1 : 0;

            await bannerService.updateBanner(id, { status: updatedStatus });

            res.status(200).json({
                success: true,
                message: "Cập nhật trạng thái thành công",
                newStatus: updatedStatus // Trả về status mới để FE cập nhật state
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    updateBanner: async (req, res) => {
        try {
            const { id } = req.params;
            const files = req.files;
            const { title, status, data } = req.body;
            const configs = JSON.parse(data);
            const config = configs[0];

            const existingBanner = await bannerService.findById(id);
            if (!existingBanner) {
                return res.status(404).json({ success: false, message: "Không tìm thấy banner" });
            }

            let image_url = existingBanner.image_url;
            if (files && files.length > 0) {
                image_url = `/uploads/banners/${files[0].filename}`;
            }

            // ĐỒNG NHẤT CÁCH CHECK STATUS TẠI ĐÂY
            const updatedStatus = (status === 'active' || status === 'true' || status === true || status == 1) ? 1 : 0;

            // Xử lý target_id thông minh hơn
            let finalTargetId = config.targetId;
            if (config.linkType === 'movie' || config.linkType === 'food') {
                const parsed = parseInt(config.targetId, 10);
                finalTargetId = isNaN(parsed) ? null : parsed;
            }
            // Nếu là article, finalTargetId sẽ giữ nguyên giá trị chuỗi slug từ Frontend gửi lên

            const updateData = {
                title: title,
                image_url: image_url,
                link_type: config.linkType,
                target_id: finalTargetId,
                external_url: config.externalUrl || '',
                status: updatedStatus
            };

            await bannerService.updateBanner(id, updateData);
            res.status(200).json({ success: true, message: "Cập nhật thành công" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    deleteBanner: async (req, res) => {
        try {
            const { id } = req.params;
            await bannerService.removeBanner(id);
            res.status(200).json({ success: true, message: "Xóa banner thành công" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = bannerController;