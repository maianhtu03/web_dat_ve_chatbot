const db = require('../config/db');

const customerModel = {
    // 1. Thêm u.is_active vào danh sách SELECT
    findAll: async (searchTerm = '') => {
        let sql = `
            SELECT 
                u.id, 
                u.fullName, 
                u.email, 
                u.phone, 
                u.gender,
                u.is_active, 
                m.member_code, 
                m.current_points, 
                m.total_spending, 
                m.rank_name
            FROM users u
            JOIN memberships m ON u.id = m.user_id
            WHERE u.role = 'user'
        `;

        const params = [];
        if (searchTerm) {
            sql += ` AND (u.fullName LIKE ? OR u.email LIKE ? OR m.member_code LIKE ?)`;
            const searchVal = `%${searchTerm}%`;
            params.push(searchVal, searchVal, searchVal);
        }

        const [rows] = await db.query(sql, params);
        return rows;
    },

    // 2. Sửa lại hàm này để thực hiện UPDATE thật vào DB
    updateActiveStatus: async (id, isActive) => {
        const [result] = await db.query(
            'UPDATE users SET is_active = ? WHERE id = ?',
            [isActive, id]
        );
        return result;
    },

    updateMembershipData: async (userId, rankName, points) => {
        const [result] = await db.query(
            'UPDATE memberships SET rank_name = ?, current_points = ? WHERE user_id = ?',
            [rankName, points, userId]
        );
        return result;
    }
};

module.exports = customerModel;