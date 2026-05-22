const cinemaService = require('../services/cinemaService');

const getCinemas = async (req, res) => {
    try {
        const data = await cinemaService.getAllCinemas();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getActiveCinemasByBranch = async (req, res) => {
    try {
        const { branchId } = req.params;
        const data = await cinemaService.getActiveCinemasByBranch(branchId);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- CHỈNH SỬA HÀM THÊM MỚI ---
const addCinema = async (req, res) => {
    try {
        // Gom dữ liệu từ body và file ảnh lại
        const cinemaData = {
            ...req.body,
            // Nếu có upload file thì lấy đường dẫn, thêm "/" ở đầu để chuẩn hiển thị
            image_url: req.file ? `/uploads/cinemas/${req.file.filename}` : null
        };

        await cinemaService.createNewCinema(cinemaData);
        res.status(201).json({ success: true, message: "Thêm rạp chiếu thành công" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// --- CHỈNH SỬA HÀM CẬP NHẬT ---
const updateCinema = async (req, res) => {
    try {
        const { id } = req.params;

        // Logic ảnh: 
        // 1. Nếu có file mới (req.file) -> lấy path mới.
        // 2. Nếu không có file mới -> giữ nguyên image_url cũ gửi từ req.body.
        const imagePath = req.file
            ? `/uploads/cinemas/${req.file.filename}`
            : req.body.image_url;

        const updateData = {
            ...req.body,
            image_url: imagePath
        };

        await cinemaService.updateCinemaInfo(id, updateData);
        res.status(200).json({ success: true, message: "Cập nhật rạp chiếu thành công" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { is_active } = req.body;
        await cinemaService.toggleCinemaStatus(req.params.id, is_active);
        res.status(200).json({ message: "Cập nhật trạng thái thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCinema = async (req, res) => {
    try {
        await cinemaService.removeCinema(req.params.id);
        res.status(200).json({ message: "Xóa rạp chiếu thành công" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const getCinemaById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await cinemaService.getCinemaDetail(id); // Gọi xuống service

        if (!data) {
            return res.status(404).json({ message: "Không tìm thấy thông tin rạp này" });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCinemas,
    getActiveCinemasByBranch,
    getCinemaById,
    addCinema,
    updateCinema,
    updateStatus,
    deleteCinema
};