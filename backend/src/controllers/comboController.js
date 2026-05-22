const comboService = require('../services/comboService');
const Combo = require('../models/comboModel');

const comboController = {
    // 1. Lấy toàn bộ danh sách combo kèm món lẻ
    getAll: async (req, res) => {
        try {
            const data = await Combo.getAll();
            res.status(200).json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error("Lỗi getAll Combo:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 2. Tạo combo mới
    createCombo: async (req, res) => {
        try {
            if (!req.body.info || !req.body.items) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin combo hoặc danh sách món ăn!"
                });
            }

            const info = JSON.parse(req.body.info);
            const items = JSON.parse(req.body.items);
            const image = req.file ? `/uploads/combos/${req.file.filename}` : null;

            const result = await comboService.createCombo({ ...info, image }, items);

            res.status(201).json({
                success: true,
                message: "Thêm combo thành công!",
                data: result
            });
        } catch (error) {
            console.error("Lỗi createCombo:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 3. Cập nhật combo
    updateCombo: async (req, res) => {
        try {
            const { id } = req.params;
            if (!req.body.info || !req.body.items) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin cập nhật!"
                });
            }

            const info = JSON.parse(req.body.info);
            const items = JSON.parse(req.body.items);

            // Nếu có file mới thì dùng path mới, nếu không thì giữ nguyên (hoặc null tùy logic Model)
            const image = req.file ? `/uploads/combos/${req.file.filename}` : info.image;

            const result = await comboService.updateCombo(id, { ...info, image }, items);

            res.status(200).json({
                success: true,
                message: "Cập nhật combo thành công!",
                data: result
            });
        } catch (error) {
            console.error("Lỗi updateCombo:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 4. Xóa combo
    deleteCombo: async (req, res) => {
        try {
            const { id } = req.params;
            // Gọi service để xóa (bao gồm xóa cả món lẻ trong combo_items)
            await comboService.deleteCombo(id);

            res.status(200).json({
                success: true,
                message: "Xóa combo thành công!"
            });
        } catch (error) {
            console.error("Lỗi deleteCombo:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = comboController;