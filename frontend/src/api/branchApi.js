import axios from 'axios';

const API_URL = 'http://localhost:5000/api/branches';

export const getBranches = () => axios.get(API_URL);
export const createBranch = (data) => axios.post(`${API_URL}/add`, data);
export const updateBranch = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const updateBranchStatus = (id, is_active) => axios.put(`${API_URL}/status/${id}`, { is_active });
export const deleteBranch = (id) => axios.delete(`${API_URL}/${id}`);
export const getActiveBranches = () => axios.get(`${API_URL}/active`);
export const getBranchTree = () => axios.get(`${API_URL}/tree-user`);

const branchApi = {
    getAll: getBranches, // Đổi tên getBranches thành getAll cho đúng với code ở UI
    getActive: getActiveBranches,
    getTree: getBranchTree
};

export default branchApi;