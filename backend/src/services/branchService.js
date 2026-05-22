const Branch = require('../models/branchModel');
const db = require('../config/db');

const getAllBranches = async () => {
    return await Branch.findAll();
};

const createNewBranch = async (name) => {
    if (!name) throw new Error("Tên chi nhánh không được để trống");
    return await Branch.create(name);
};

const toggleBranchStatus = async (id, is_active) => {
    return await Branch.updateStatus(id, is_active);
};

const removeBranch = async (id) => {
    // Logic kiểm tra ràng buộc: Nếu chi nhánh có rạp (cinemas) thì không cho xóa
    const [cinemas] = await db.execute("SELECT id FROM cinemas WHERE branch_id = ?", [id]);
    if (cinemas.length > 0) {
        throw new Error("Không thể xóa chi nhánh đang có cụm rạp hoạt động");
    }
    return await Branch.delete(id);
};
const updateBranchInfo = async (id, name) => {
    // Kiểm tra dữ liệu đầu vào
    if (!name) throw new Error("Tên chi nhánh không được để trống");

    // Gọi đến hàm update trong Model Branch mà bạn vừa sửa
    return await Branch.update(id, name);
};
// Thêm hàm này để lấy chi nhánh đang hoạt động
const getActiveBranches = async () => {
    return await Branch.findActive(); // Gọi hàm findActive trong Model
};
// branchService.js
const getBranchTreeData = async () => {
    // Gọi hàm từ model
    const rows = await Branch.getRawBranchTree();

    // Chỉ giữ lại logic nhóm mảng (reduce) ở đây
    return rows.reduce((acc, row) => {
        let branch = acc.find(b => b.id === row.branch_id);
        if (!branch) {
            branch = { id: row.branch_id, name: row.branch_name, cinemas: [] };
            acc.push(branch);
        }
        if (row.cinema_id) {
            branch.cinemas.push({ id: row.cinema_id, name: row.cinema_name });
        }
        return acc;
    }, []);
};
module.exports = {
    getAllBranches,
    getActiveBranches,
    getBranchTreeData,
    createNewBranch,
    updateBranchInfo,
    toggleBranchStatus,
    removeBranch
};