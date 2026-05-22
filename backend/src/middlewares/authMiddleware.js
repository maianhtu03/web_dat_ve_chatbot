import jwt from 'jsonwebtoken';
import db from '../config/db.js';
export const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Không tìm thấy Token!" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [users] = await db.execute('SELECT is_active FROM users WHERE id = ?', [decoded.id]);

        if (users.length === 0 || Number(users[0].is_active) === 0) {
            return res.status(403).json({
                message: "Tài khoản của bạn đã bị khóa hoặc không tồn tại. Vui lòng đăng nhập lại!"
            });
        }
        req.user = decoded; // Lưu thông tin user vào request (bao gồm id, role, permissions)
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token không hợp lệ!" });
    }
};

// Middleware kiểm tra quyền cụ thể
export const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        const { role, permissions } = req.user;

        // Nếu là admin và có quyền cụ thể trong mảng permissions
        if (role === 'admin' && permissions.includes(requiredPermission)) {
            return next();
        }
        // 2. Nếu là Staff: Kiểm tra xem mã quyền có trong mảng permissions không
        if (role === 'staff' && permissions && permissions.includes(requiredPermission)) {
            return next();
        }

        return res.status(403).json({ message: "Bạn không có quyền truy cập chức năng này!" });
    };
};