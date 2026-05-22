const db = require('../config/db');

const MemberModel = {
    // 1. Tìm thông tin thẻ (Lấy dữ liệu THỰC từ DB, không tính toán cứng %)
    findByUserId: async (userId) => {
        const sql = `
            SELECT 
                m.*, 
                u.createdAt AS registration_date
            FROM memberships m
            JOIN users u ON m.user_id = u.id
            WHERE m.user_id = ?
        `;

        const [rows] = await db.execute(sql, [userId]);

        if (rows[0]) {
            const data = rows[0];
            // Đảm bảo các giá trị số luôn là kiểu Number
            data.total_spending = Number(data.total_spending);
            data.current_points = Number(data.current_points);
            data.total_points_accumulated = Number(data.total_points_accumulated);
            return data;
        }
        return null;
    },

    // 2. Tạo thẻ mới (Giữ nguyên logic của bạn nhưng chuẩn hóa SQL)
    create: async (memberData) => {
        const { user_id, member_code } = memberData;
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        const sql = `
            INSERT INTO memberships 
            (user_id, member_code, rank_name, total_spending, current_points, 
             total_points_accumulated, used_points, expiring_points, 
             activated_date, expiry_date) 
            SELECT id, ?, 'Standard', 0, 0, 0, 0, 0, createdAt, ? 
            FROM users WHERE id = ?
        `;
        return await db.execute(sql, [member_code, expiryDate, user_id]);
    },

    // 3. Cập nhật chi tiêu (Logic này chuẩn vì points đã được Service tính toán theo hạng)
    updateSpending: async (userId, amount, points) => {
        const sql = `
            UPDATE memberships 
            SET total_spending = total_spending + ?, 
                current_points = current_points + ?,
                total_points_accumulated = total_points_accumulated + ?
            WHERE user_id = ?`;
        return await db.execute(sql, [amount, points, points, userId]);
    },
    // 8. Lấy lịch sử biến động điểm từ bảng bookings
    getPointHistory: async (userId) => {
        const sql = `
            SELECT 
                id AS order_id,
                total_price,
                points_used,
                points_earned,
                payment_date,
                created_at,
                payment_status
            FROM bookings 
            WHERE user_id = ? AND payment_status = 'paid'
            ORDER BY created_at DESC
        `;
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    },

    // 4. Cập nhật hạng thẻ: CẦN THÊM expiry_date khi thăng hạng
    updateRank: async (userId, newRank, newExpiryDate) => {
        const sql = `
            UPDATE memberships 
            SET rank_name = ?, 
                expiry_date = ? 
            WHERE user_id = ?`;
        return await db.execute(sql, [newRank, newExpiryDate, userId]);
    },

    // 5. Tìm các thành viên đã hết hạn hạng thẻ (Phục vụ logic tụt hạng)
    getExpiredMembers: async () => {
        const sql = `SELECT * FROM memberships WHERE expiry_date <= NOW() AND rank_name != 'Standard'`;
        const [rows] = await db.execute(sql);
        return rows;
    },

    // 6. Gia hạn thời gian sử dụng hạng thẻ (Khi đủ điều kiện duy trì)
    extendExpiry: async (userId, newExpiryDate) => {
        const sql = `UPDATE memberships SET expiry_date = ? WHERE user_id = ?`;
        return await db.execute(sql, [newExpiryDate, userId]);
    },

    // 7. Đổi điểm (Giữ nguyên)
    usePoints: async (userId, pointsToUse) => {
        const sql = `
            UPDATE memberships 
            SET current_points = current_points - ?, 
                used_points = used_points + ? 
            WHERE user_id = ? AND current_points >= ?`;
        return await db.execute(sql, [pointsToUse, pointsToUse, userId, pointsToUse]);
    }
};

module.exports = MemberModel;