const templateService = require('../services/seatTemplateService');

const getTemplates = async (req, res) => {
    try {
        const data = await templateService.getAllTemplates();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addTemplate = async (req, res) => {
    try {
        // Nhận dữ liệu từ FE (name, matrix_size, normal_rows, vip_rows, couple_rows, description)
        // Lưu ý: matrix_size lúc này là chuỗi "12x14" do FE đóng gói
        const result = await templateService.createNewTemplate(req.body);

        res.status(201).json({
            message: "Khởi tạo mẫu và sinh sơ đồ ghế thành công",
            id: result
        });
    } catch (error) {
        // Trả về lỗi nếu logic cộng hàng không khớp (xử lý ở Service)
        res.status(400).json({ message: error.message });
    }
};

// 1. Sửa hàm lấy chi tiết để chặn Cache (Xử lý lỗi 304)
const getTemplateDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const detail = await templateService.getTemplateById(id);

        if (!detail) return res.status(404).json({ message: "Không tìm thấy mẫu" });

        // CHẶN CACHE TẠI ĐÂY: Ép trình duyệt luôn lấy dữ liệu mới từ Server
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

        res.status(200).json(detail);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Kiểm tra hàm cập nhật (Đảm bảo Service xử lý trường status)
const updateTemplateInfo = async (req, res) => {
    try {
        const { id } = req.params;
        // Log này rất quan trọng, hãy xem ở Console Backend có "status: 'published'" không
        console.log("Dữ liệu FE gửi lên:", req.body);

        // Đảm bảo req.body chứa { status: 'published' }
        await templateService.editTemplateInfo(id, req.body);

        res.status(200).json({ message: "Cập nhật thành công" });
    } catch (error) {
        console.error("LỖI TẠI CONTROLLER:", error);
        res.status(500).json({ message: error.message });
    }
};
const updateStatus = async (req, res) => {
    try {
        const { is_active } = req.body;
        await templateService.toggleStatus(req.params.id, is_active);
        res.status(200).json({ message: "Cập nhật trạng thái thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSingleSeat = async (req, res) => {
    try {
        const { seatId } = req.params; // FE gửi lên là :seatId
        // Hãy đảm bảo bạn truyền ĐÚNG seatId vào service
        await templateService.updateSeatDetail(seatId, req.body);
        res.status(200).json({ message: "Cập nhật thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deleteTemplate = async (req, res) => {
    try {
        // Service sẽ lo việc xóa mẫu và các ghế liên quan trong bảng seats
        await templateService.removeTemplate(req.params.id);
        res.status(200).json({ message: "Xóa mẫu và các ghế liên quan thành công" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const getTemplateSeats = async (req, res) => {
    try {
        const { id } = req.params;
        const seats = await templateService.getSeatsByTemplateId(id);
        res.status(200).json(seats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const updateRowStatus = async (req, res) => {
    try {
        const { templateId, rowLabel } = req.params;
        const { status } = req.body;

        // Bạn cần thêm hàm này vào Service và Model nữa
        await templateService.updateRowStatus(templateId, rowLabel, status);

        res.status(200).json({ message: "Cập nhật hàng ghế thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const updateBrokenSeats = async (req, res) => {
    try {
        const templateId = req.params.id;
        const { brokenSeatIds } = req.body;

        if (!templateId) {
            return res.status(400).json({ message: "Thiếu Template ID" });
        }

        // THÊM: Kiểm tra nếu brokenSeatIds không phải là mảng
        if (brokenSeatIds && !Array.isArray(brokenSeatIds)) {
            return res.status(400).json({ message: "Danh sách ID ghế hỏng không hợp lệ" });
        }

        await templateService.updateBrokenStatus(templateId, brokenSeatIds || []);
        res.status(200).json({ message: "Cập nhật thành công" });
    } catch (error) {
        console.error("Lỗi updateBrokenSeats:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTemplates,
    addTemplate,
    updateStatus,
    deleteTemplate,
    getTemplateDetail,
    updateTemplateInfo,
    updateSingleSeat,
    getTemplateSeats,
    updateRowStatus,
    updateBrokenSeats
};