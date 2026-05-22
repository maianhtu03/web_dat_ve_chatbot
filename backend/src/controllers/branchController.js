const branchService = require('../services/branchService');

const getBranches = async (req, res) => {
    try {
        const data = await branchService.getAllBranches();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addBranch = async (req, res) => {
    try {
        const { name } = req.body;
        await branchService.createNewBranch(name);
        res.status(201).json({ message: "Thêm chi nhánh thành công" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        await branchService.toggleBranchStatus(id, is_active);
        res.status(200).json({ message: "Cập nhật trạng thái thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;
        await branchService.removeBranch(id);
        res.status(200).json({ message: "Xóa chi nhánh thành công" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body; // Chỉ lấy name vì DB không có address

        // Gọi service để thực thi câu lệnh SQL UPDATE
        await branchService.updateBranchInfo(id, name);

        res.status(200).json({ message: "Cập nhật chi nhánh thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Lấy danh sách chi nhánh đang hoạt động (dùng cho Dropdown)
const getActiveBranches = async (req, res) => {
    try {
        // Bạn cần đảm bảo đã viết hàm findActive() trong branchService
        const data = await branchService.getActiveBranches();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getBranchTree = async (req, res) => {
    try {
        // Gọi hàm từ service để lấy dữ liệu đã được xử lý lồng nhau
        const data = await branchService.getBranchTreeData();
        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy cây dữ liệu chi nhánh: " + error.message
        });
    }
};
module.exports = {
    getBranches,
    getActiveBranches,
    getBranchTree,
    addBranch,
    updateBranch,
    updateStatus,
    deleteBranch
};