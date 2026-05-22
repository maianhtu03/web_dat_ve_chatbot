const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

router.get('/', branchController.getBranches);
router.get('/active', branchController.getActiveBranches);

router.get('/tree-user', branchController.getBranchTree);
router.post('/add', branchController.addBranch);

// THÊM DÒNG NÀY ĐỂ XỬ LÝ CẬP NHẬT TÊN/THÔNG TIN
router.put('/:id', branchController.updateBranch);

router.put('/status/:id', branchController.updateStatus);
router.delete('/:id', branchController.deleteBranch);

module.exports = router;