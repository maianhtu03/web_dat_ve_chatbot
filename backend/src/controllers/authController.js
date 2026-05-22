const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// 1. XỬ LÝ ĐĂNG KÝ (REGISTER)
const register = async (req, res) => {
    try {
        // Lấy dữ liệu từ Form gửi lên
        const { fullName, email, password, birthday, gender, phone } = req.body;

        // Kiểm tra xem email đã tồn tại chưa
        const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Email này đã được sử dụng!" });
        }

        // Mã hóa mật khẩu (băm mật khẩu)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Lưu vào Database
        const sql = `INSERT INTO users (fullName, email, password, birthday, gender, phone) 
                     VALUES (?, ?, ?, ?, ?, ?)`;

        await db.execute(sql, [fullName, email, hashedPassword, birthday, gender, phone]);

        return res.status(201).json({ message: "Đăng ký thành công! Hãy đăng nhập." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi máy chủ khi đăng ký!", error });
    }
};

// 2. XỬ LÝ ĐĂNG NHẬP (LOGIN)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra user có tồn tại không
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        const user = users[0];
        // --- BƯỚC QUAN TRỌNG: KIỂM TRA TÀI KHOẢN CÓ ĐANG BỊ KHÓA KHÔNG ---
        // Ép kiểu Number để so sánh chính xác với giá trị 0 từ Database
        if (Number(user.is_active) === 0) {
            return res.status(403).json({
                message: "Tài khoản của bạn đã bị khóa bởi quản trị viên. Vui lòng liên hệ hỗ trợ để được mở khóa!"
            });
        }
        // ----------

        // So sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa trong DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        // --- BƯỚC MỚI: LẤY DANH SÁCH QUYỀN (PERMISSIONS) ---
        let permissions = [];
        if (user.role === 'staff') {
            const [permRows] = await db.execute(`
                SELECT p.permission_code 
                FROM permissions p
                JOIN user_permissions up ON p.id = up.permission_id
                WHERE up.user_id = ?`,
                [user.id]
            );
            // Chuyển từ mảng object [{permission_code: 'movies'}, ...] thành ['movies', ...]
            permissions = permRows.map(row => row.permission_code);
        }

        // Tạo JWT Token để duy trì trạng thái đăng nhập
        const token = jwt.sign(
            {
                id: user.id, role: user.role, fullName: user.fullName, birthday: user.birthday,
                gender: user.gender, permissions: permissions
            },
            process.env.JWT_SECRET, // Thay bằng mã bí mật bất kỳ của bạn
            { expiresIn: '1d' }
        );

        // Trả về thông tin (không trả về mật khẩu)
        return res.status(200).json({
            message: "Đăng nhập thành công!",
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                birthday: user.birthday, // Thêm dòng này để lấy ngày sinh
                gender: user.gender,
                role: user.role,
                permissions: permissions
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi máy chủ khi đăng nhập!" });
    }
};
// 3. XỬ LÝ CẬP NHẬT THÔNG TIN (UPDATE PROFILE)
const updateProfile = async (req, res) => {
    try {
        const { fullName, birthday, gender, phone, idCard, address, email } = req.body;

        // --- BƯỚC SỬA LỖI QUAN TRỌNG TẠI ĐÂY ---
        let formattedBirthday = null;
        if (birthday) {
            // Nếu birthday là '2026-03-28T17:00:00.000Z', lệnh split('T')[0] sẽ lấy ra '2026-03-28'
            formattedBirthday = birthday.split('T')[0];
        }
        // ---------------------------------------

        const sql = `
            UPDATE users 
            SET fullName = ?, birthday = ?, gender = ?, phone = ?, idCard = ?, address = ? 
            WHERE email = ?
        `;

        const values = [
            fullName,
            formattedBirthday, // Sử dụng biến đã được định dạng lại YYYY-MM-DD
            gender,
            phone,
            idCard || null,
            address || null,
            email
        ];

        await db.execute(sql, values);

        return res.status(200).json({
            message: "Cập nhật thông tin thành công!",
            user: { ...req.body, birthday: formattedBirthday }
        });

    } catch (error) {
        console.error("Lỗi cập nhật profile:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ khi cập nhật thông tin!",
            error: error.message
        });
    }
};
const changePassword = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;

        // 1. Lấy thông tin user
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: "Người dùng không tồn tại" });

        const user = users[0];

        // 2. Kiểm tra mật khẩu hiện tại có đúng không
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu hiện tại không chính xác!" });
        }

        // 3. Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // 4. Cập nhật vào DB
        await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedNewPassword, email]);

        return res.status(200).json({ message: "Đổi mật khẩu thành công!" });

    } catch (error) {
        return res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};
//Doi mat khau
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // 1. Kiểm tra Email có tồn tại trong hệ thống không
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(404).json({ message: "Email này chưa được đăng ký tài khoản!" });
        }

        const user = users[0];

        // 2. Tạo mật khẩu mới ngẫu nhiên (8 ký tự)
        // toString(36) tạo chuỗi bao gồm cả chữ và số
        const newPassword = Math.random().toString(36).slice(-8);

        // 3. Mã hóa (Hash) mật khẩu mới trước khi lưu vào Database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Cập nhật mật khẩu đã mã hóa vào bảng users trong Database
        await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

        // 5. Gửi Email chứa mật khẩu GỐC (chưa mã hóa) cho người dùng
        // Sử dụng hàm sendEmail từ thư mục utils
        await sendEmail({
            email: email,
            subject: 'Khôi phục mật khẩu - MTU Cinemas',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #007bff;">Xin chào, ${user.fullName}</h2>
                    <p>Bạn vừa yêu cầu khôi phục mật khẩu tại <b>MTU Cinemas</b>.</p>
                    <p>Mật khẩu mới của bạn là: <b style="color: red; font-size: 1.2rem;">${newPassword}</b></p>
                    <p>Vui lòng đăng nhập và thực hiện <b>đổi lại mật khẩu</b> ngay để đảm bảo an toàn.</p>
                    <hr />
                    <p style="font-size: 0.8rem; color: #888;">Đây là email tự động, vui lòng không trả lời.</p>
                </div>
            `
        });

        // 6. Trả về thông báo thành công cho Frontend
        return res.status(200).json({
            message: "Mật khẩu mới đã được gửi thành công vào Email của bạn!"
        });

    } catch (error) {
        console.error("Lỗi Quên mật khẩu:", error);
        return res.status(500).json({
            message: "Đã xảy ra lỗi hệ thống khi gửi mail. Vui lòng thử lại sau!"
        });
    }
};

module.exports = { register, login, forgotPassword, updateProfile, changePassword };