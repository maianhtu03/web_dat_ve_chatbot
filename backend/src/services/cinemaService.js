const Cinema = require('../models/cinemaModel');

const getAllCinemas = async () => {
    return await Cinema.findAll();
};

const getActiveCinemasByBranch = async (branchId) => {
    if (!branchId) return [];
    return await Cinema.findActiveByBranch(branchId);
};
const getCinemaDetail = async (id) => {
    if (!id) throw new Error("ID rạp không hợp lệ");

    const cinema = await Cinema.findById(id);
    if (!cinema) {
        return null; // Trả về null để controller xử lý báo lỗi 404
    }
    return cinema;
};
// --- CẬP NHẬT: Thêm logic kiểm tra cho các cột mới ---
const createNewCinema = async (cinemaData) => {
    const { name, branch_id, address, hotline } = cinemaData;

    // Kiểm tra các trường bắt buộc
    if (!name || !branch_id || !address) {
        throw new Error("Vui lòng điền đầy đủ: Tên rạp, Chi nhánh và Địa chỉ");
    }

    // Đảm bảo dữ liệu gửi xuống Model là chuẩn
    const cleanData = {
        ...cinemaData,
        branch_id: parseInt(branch_id), // Ép kiểu số để tránh lỗi DB
        is_active: cinemaData.is_active !== undefined ? cinemaData.is_active : 1
    };

    return await Cinema.create(cleanData);
};

// --- CẬP NHẬT: Xử lý logic Update ---
const updateCinemaInfo = async (id, cinemaData) => {
    const existing = await Cinema.findById(id);
    if (!existing) {
        throw new Error("Rạp chiếu không tồn tại");
    }

    // Kết hợp dữ liệu cũ và dữ liệu mới để không bị mất thông tin
    const updatedData = {
        name: cinemaData.name || existing.name,
        branch_id: cinemaData.branch_id ? parseInt(cinemaData.branch_id) : existing.branch_id,
        address: cinemaData.address || existing.address,
        description: cinemaData.description !== undefined ? cinemaData.description : existing.description,
        hotline: cinemaData.hotline !== undefined ? cinemaData.hotline : existing.hotline,
        image_url: cinemaData.image_url !== undefined ? cinemaData.image_url : existing.image_url,
        map_iframe: cinemaData.map_iframe !== undefined ? cinemaData.map_iframe : existing.map_iframe,
        is_active: cinemaData.is_active !== undefined ? cinemaData.is_active : existing.is_active
    };

    return await Cinema.update(id, updatedData);
};

const toggleCinemaStatus = async (id, is_active) => {
    return await Cinema.updateStatus(id, is_active);
};

const removeCinema = async (id) => {
    const existing = await Cinema.findById(id);
    if (!existing) throw new Error("Rạp chiếu không tồn tại");

    return await Cinema.delete(id);
};

module.exports = {
    getAllCinemas,
    getCinemaDetail,
    getActiveCinemasByBranch,
    createNewCinema,
    updateCinemaInfo,
    toggleCinemaStatus,
    removeCinema
};