import db from '../config/db.js';

// 1. Tìm user theo email (Dùng cho Login/Register)
export const findUserByEmail = async (email) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

// 2. Lấy danh sách mã quyền của User (Dùng để đính kèm vào Token khi Login)
export const getPermissionsByUserId = async (userId) => {
    const [rows] = await db.execute(`
        SELECT p.permission_code 
        FROM permissions p
        JOIN user_permissions up ON p.id = up.permission_id
        WHERE up.user_id = ?`, [userId]);
    return rows.map(row => row.permission_code);
};

// 3. Tạo User mới (Dùng khi Admin tạo tài khoản cho Staff)
export const createUser = async (userData) => {
    const { fullName, email, password, birthday, gender, phone, role } = userData;
    const sql = `INSERT INTO users (fullName, email, password, birthday, gender, phone, role) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [fullName, email, password, birthday, gender, phone, role]);
    return result.insertId; // Trả về ID vừa tạo để dùng gán quyền ngay sau đó
};

// 4. Gán quyền cho User (Lưu vào bảng trung gian)
export const assignPermissions = async (userId, permissionIds) => {
    // permissionIds là mảng ID [1, 2, 5]
    const values = permissionIds.map(pId => [userId, pId]);
    const sql = 'INSERT INTO user_permissions (user_id, permission_id) VALUES ?';
    return await db.query(sql, [values]);
};

// 5. Xóa toàn bộ quyền cũ (Dùng khi Admin muốn cập nhật lại quyền cho Staff)
export const clearUserPermissions = async (userId) => {
    return await db.execute('DELETE FROM user_permissions WHERE user_id = ?', [userId]);
};

// 6. Cập nhật thông tin Profile (Dùng cho trang Account Info)
const updateUserProfile = async (userData) => {
    const { fullName, birthday, gender, phone, idCard, address, email } = userData;

    // Xử lý để tránh lỗi 500 khi dữ liệu trống
    const safeBirthday = (birthday && birthday.trim() !== "") ? birthday : null;
    const safeIdCard = (idCard && idCard.trim() !== "") ? idCard : null;
    const safeAddress = (address && address.trim() !== "") ? address : null;

    const sql = `
        UPDATE users 
        SET fullName = ?, birthday = ?, gender = ?, phone = ?, idCard = ?, address = ? 
        WHERE email = ?
    `;

    const [result] = await db.execute(sql, [
        fullName,
        safeBirthday, // Dùng giá trị đã xử lý null
        gender,
        phone,
        safeIdCard,   // Dùng giá trị đã xử lý null
        safeAddress,  // Dùng giá trị đã xử lý null
        email
    ]);

    return result;
};