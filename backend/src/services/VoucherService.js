const VoucherModel = require('../models/VoucherModel');
const db = require('../config/db'); // Nên import sẵn ở đầu file

const VoucherService = {
    // ==========================================
    // LOGIC CHO ADMIN (Đã có của bạn)
    // ==========================================
    getAllVouchers: async () => {
        return await VoucherModel.findAll();
    },

    createVoucher: async (voucherData) => {
        const existing = await VoucherModel.findByCode(voucherData.voucher_code);
        if (existing) {
            throw new Error("Mã voucher này đã tồn tại trên hệ thống!");
        }

        if (new Date(voucherData.start_date) >= new Date(voucherData.expiry_date)) {
            throw new Error("Ngày bắt đầu phải trước ngày hết hạn!");
        }

        return await VoucherModel.create(voucherData);
    },

    giveVoucherByTargetRank: async (userId, rankName) => {
        const sql = `
            SELECT id FROM vouchers 
            WHERE target_rank = ? 
            AND is_global = 0 
            AND is_active = 1 
            AND expiry_date >= NOW()
            ORDER BY created_at DESC LIMIT 1
        `;

        const [vouchers] = await db.execute(sql, [rankName]);

        if (vouchers && vouchers.length > 0) {
            const voucherId = vouchers[0].id;
            const insertSql = `INSERT INTO user_vouchers (user_id, voucher_id, status) VALUES (?, ?, 'unused')`;
            await db.execute(insertSql, [userId, voucherId]);
        }
    },
    getVoucherById: async (id) => {
        return await VoucherModel.findById(id);
    },

    // 2. CẬP NHẬT VOUCHER (BỔ SUNG)
    // Dùng để lưu dữ liệu sau khi Admin sửa xong
    updateVoucher: async (id, voucherData) => {
        // Kiểm tra logic ngày tháng trước khi update tương tự như lúc tạo
        if (voucherData.start_date && voucherData.expiry_date) {
            if (new Date(voucherData.start_date) >= new Date(voucherData.expiry_date)) {
                throw new Error("Ngày bắt đầu phải trước ngày hết hạn!");
            }
        }
        return await VoucherModel.update(id, voucherData);
    },

    // 3. XÓA VOUCHER (BỔ SUNG)
    // Dùng cho nút Thùng rác
    deleteVoucher: async (id) => {
        return await VoucherModel.delete(id);
    },
    // Hàm tặng voucher khi thăng hạng (Đã có của bạn)
    giveVoucherToUser: async (userId, voucherCode) => {
        const voucher = await VoucherModel.findByCode(voucherCode);
        if (voucher) {
            const sql = `INSERT INTO user_vouchers (user_id, voucher_id, status) VALUES (?, ?, 'unused')`;
            await db.execute(sql, [userId, voucher.id]);
        }
    },

    // ==========================================
    // LOGIC CHO USER (BỔ SUNG MỚI)
    // ==========================================

    /**
     * Lấy danh sách voucher trong "Ví" của User (Chỉ lấy mã còn hạn và chưa dùng)
     */
    /**
      * Lấy danh sách voucher cho User (Gồm voucher công khai và voucher được tặng riêng)
      */
    getUserVouchers: async (userId) => {
        try {
            const sql = `
                SELECT DISTINCT v.* FROM vouchers v
                LEFT JOIN user_vouchers uv ON v.id = uv.voucher_id AND uv.user_id = ?
                WHERE v.is_active = 1 
                AND v.expiry_date >= NOW()
                AND (
                    -- 1. Voucher công khai
                    v.is_global = 1 
                    OR 
                    -- 2. Voucher riêng trong ví của user
                    (v.is_global = 0 AND uv.user_id IS NOT NULL AND uv.status = 'unused')
                )
                AND (
                    -- Kiểm tra giới hạn dùng mỗi khách dựa trên bảng bookings
                    -- (Cần thêm cột voucher_id vào bảng bookings nếu bạn muốn ràng buộc chặt chẽ)
                    -- Tạm thời nếu chưa có voucher_id trong bookings, ta bỏ qua check này để hiện dữ liệu
                    1 = 1 
                )
                ORDER BY v.created_at DESC
            `;

            const [rows] = await db.execute(sql, [userId]);
            return rows;
        } catch (error) {
            console.error("Lỗi tại VoucherService:", error);
            throw error;
        }
    },
    /**
     * Kiểm tra và tính toán giảm giá
     * Hàm này cực kỳ quan trọng để bảo mật (tránh user sửa giá ở Frontend)
     */
    validateAndApply: async (userId, voucherCode, orderValue) => {
        const voucher = await VoucherModel.findByCode(voucherCode);

        // 1. Kiểm tra tồn tại và trạng thái
        if (!voucher || !voucher.is_active) {
            throw new Error("Mã giảm giá không tồn tại hoặc đã bị khóa");
        }

        // 2. Kiểm tra thời gian hiệu lực
        const now = new Date();
        if (now < new Date(voucher.start_date) || now > new Date(voucher.expiry_date)) {
            throw new Error("Mã giảm giá chưa đến hạn dùng hoặc đã hết hạn");
        }

        // 3. Kiểm tra giá trị đơn hàng tối thiểu
        if (orderValue < voucher.min_order_value) {
            throw new Error(`Đơn hàng tối thiểu phải từ ${voucher.min_order_value.toLocaleString('vi-VN')}đ để dùng mã này`);
        }
        if (voucher.used_count >= voucher.usage_limit) {
            throw new Error("Mã giảm giá này đã hết lượt sử dụng");
        }

        // 4. Nếu là voucher cá nhân (is_global = 0), kiểm tra quyền sở hữu
        if (!voucher.is_global) {
            const [userOwns] = await db.execute(
                'SELECT * FROM user_vouchers WHERE user_id = ? AND voucher_id = ? AND status = "unused"',
                [userId, voucher.id]
            );
            if (userOwns.length === 0) {
                throw new Error("Bạn không sở hữu mã giảm giá này hoặc mã đã được sử dụng");
            }
        }
        // Dòng 135
        const checkLimitSql = `SELECT COUNT(*) as usedCount FROM bookings WHERE user_id = ? AND voucher_id = ?`;
        const [usageRows] = await db.execute(checkLimitSql, [userId, voucher.id]);

        if (usageRows[0].usedCount >= voucher.limit_per_user) {
            throw new Error(`Mã này chỉ được sử dụng tối đa ${voucher.limit_per_user} lần mỗi người khách.`);
        }

        // 5. Tính toán số tiền giảm
        let discount = 0;
        if (voucher.discount_type === 'percent') {
            discount = (orderValue * voucher.discount_value) / 100;
            // Áp dụng mức giảm tối đa nếu có
            if (voucher.max_discount_amount) {
                discount = Math.min(discount, voucher.max_discount_amount);
            }
        } else {
            // Loại giảm tiền mặt (fixed)
            discount = voucher.discount_value;
        }

        // Không cho phép tiền giảm lớn hơn tổng tiền đơn hàng
        discount = Math.min(discount, orderValue);

        return {
            voucherId: voucher.id,
            voucherCode: voucher.voucher_code,
            discountAmount: discount,
            finalTotal: orderValue - discount
        };
    },
    // Trong VoucherService.js
    updateUsageCount: async (voucherId) => {
        try {
            // Bước 1: Log kiểm tra xem Controller có thực sự gọi được vào đây không
            console.log(">>> [VoucherService] Đang thực thi updateUsageCount cho ID:", voucherId);

            if (!voucherId) {
                console.error(">>> [VoucherService] Lỗi: voucherId bị undefined hoặc null!");
                return false;
            }

            // Bước 2: Sử dụng execute thay vì query để đồng bộ driver
            const sql = `UPDATE vouchers SET used_count = COALESCE(used_count, 0) + 1 WHERE id = ?`;
            const [result] = await db.execute(sql, [voucherId]);

            // Bước 3: Kiểm tra xem có dòng nào trong DB bị tác động không
            if (result.affectedRows > 0) {
                console.log(">>> [VoucherService] Cập nhật used_count THÀNH CÔNG.");
            } else {
                console.warn(">>> [VoucherService] Cập nhật THẤT BẠI: Không tìm thấy Voucher với ID này.");
            }

            return true;
        } catch (error) {
            // Bước 4: Log chi tiết lỗi SQL nếu có
            console.error(">>> [VoucherService] Lỗi SQL nghiêm trọng:", error.message);
            throw error;
        }
    }
};

module.exports = VoucherService;