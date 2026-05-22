const chatbotService = require("../services/chatbotService");

/**
 * Điều hướng yêu cầu chat từ người dùng tới AI Service
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleChat = async (req, res) => {
    try {
        // 1. Lấy dữ liệu từ request body
        const { message, userId, currentCinema } = req.body;

        // 2. Kiểm tra dữ liệu đầu vào (Validation)
        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Nội dung tin nhắn không được để trống."
            });
        }

        // 3. Gọi Service xử lý AI (Truyền thêm userId nếu có để cá nhân hóa hoặc lưu lịch sử)
        // Đảm bảo userId được ép kiểu số nếu hệ thống dùng ID là Integer
        const numericUserId = userId ? parseInt(userId, 10) : null;

        const reply = await chatbotService.getChatResponse(numericUserId, message.trim(), currentCinema);

        // 4. Phản hồi thành công về Frontend
        return res.status(200).json({
            success: true,
            reply: reply
        });

    } catch (error) {
        // 5. Ghi log lỗi để debug hệ thống
        console.error("[ChatbotController Error]:", error.message);

        // Phản hồi lỗi về Client
        return res.status(500).json({
            success: false,
            message: "Hệ thống hỗ trợ MTU Cinemas đang gặp sự cố kỹ thuật.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { handleChat };