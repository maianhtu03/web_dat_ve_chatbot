const foodService = require('../services/foodService');

const foodController = {
    getAllFoods: async (req, res) => {
        try {
            const data = await foodService.findAll();
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    addFood: async (req, res) => {
        try {
            // Dữ liệu văn bản nằm trong req.body, file nằm trong req.file
            const foodData = {
                ...req.body,
                // Lưu đường dẫn file vào database
                image: req.file ? `/uploads/foods/${req.file.filename}` : null
            };

            await foodService.createFood(foodData);
            res.status(201).json({ success: true, message: "Thêm đồ ăn thành công" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateFood: async (req, res) => {
        try {
            const { id } = req.params;

            // Logic xử lý ảnh: 
            // Nếu có file mới thì dùng path file mới, nếu không thì giữ link cũ từ body
            const imagePath = req.file
                ? `/uploads/foods/${req.file.filename}`
                : req.body.image;

            const updateData = {
                ...req.body,
                image: imagePath
            };

            await foodService.updateFood(id, updateData);
            res.status(200).json({ success: true, message: "Cập nhật thành công" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Thêm hàm này để xử lý riêng nút Switch trạng thái ở Table
    updateFoodStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            await foodService.updateFood(id, { status });
            res.status(200).json({ success: true, message: "Cập nhật trạng thái thành công" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    deleteFood: async (req, res) => {
        try {
            const { id } = req.params;
            await foodService.removeFood(id);
            res.status(200).json({ success: true, message: "Xóa thành công" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = foodController;