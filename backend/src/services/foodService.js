const Food = require('../models/foodModel');

const foodService = {
    findAll: async () => {
        return await Food.getAll();
    },

    createFood: async (data) => {
        // Ép kiểu price sang số để tránh lỗi database
        const cleanData = { ...data, price: parseFloat(data.price) };
        return await Food.create(cleanData);
    },

    updateFood: async (id, data) => {
        // Kiểm tra xem món ăn có tồn tại không
        const currentFood = await Food.getById(id);
        if (!currentFood || currentFood.length === 0) {
            throw new Error("Không tìm thấy món ăn");
        }

        const existing = currentFood[0];
        const updatedData = {
            name: data.name !== undefined ? data.name : existing.name,
            type: data.type !== undefined ? data.type : existing.type,
            price: data.price !== undefined ? parseFloat(data.price) : existing.price,
            image: data.image !== undefined ? data.image : existing.image,
            status: data.status !== undefined ? data.status : existing.status
        };

        return await Food.update(id, updatedData);
    },

    removeFood: async (id) => {
        return await Food.delete(id);
    }
};

module.exports = foodService;