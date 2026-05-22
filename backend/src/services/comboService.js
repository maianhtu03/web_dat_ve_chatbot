const Combo = require('../models/comboModel');
const db = require('../config/db');

const comboService = {
    // 1. THÊM COMBO
    createCombo: async (info, items) => {
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try {
            // Lưu thông tin combo chính
            const comboId = await Combo.create(info);

            // Lưu danh sách món ăn đi kèm
            if (items && items.length > 0) {
                for (let item of items) {
                    await Combo.addItems(comboId, item.food_id, item.quantity);
                }
            }

            await connection.commit();
            return { id: comboId, ...info };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // 2. SỬA COMBO
    updateCombo: async (id, info, items) => {
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try {
            // Cập nhật thông tin cơ bản (Tên, giá, mô tả, ảnh)
            await Combo.update(id, info);

            // Cập nhật danh sách món lẻ:
            // Cách tối ưu nhất: Xóa sạch món cũ của combo này và chèn lại mảng mới
            if (items) {
                await Combo.deleteItems(id); // Hàm này xóa trong bảng combo_items
                if (items.length > 0) {
                    for (let item of items) {
                        await Combo.addItems(id, item.food_id, item.quantity);
                    }
                }
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // 3. XÓA COMBO
    deleteCombo: async (id) => {
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try {
            // Lưu ý: Nếu database bạn đã cài đặt ON DELETE CASCADE cho khóa ngoại 
            // thì chỉ cần xóa ở bảng combos, bảng combo_items sẽ tự mất.
            // Nếu chưa cài, ta phải xóa thủ công ở combo_items trước.
            await Combo.deleteItems(id);
            await Combo.delete(id);

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = comboService;