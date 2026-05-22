import axios from 'axios';

// 1. Cấu hình instance Axios để dùng chung (tránh lặp lại URL)
const chatbotClient = axios.create({
    baseURL: 'http://localhost:5000/api/chatbot',
    timeout: 60000, // Gemini có thể phản hồi hơi lâu, để 20s cho chắc chắn
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Hàm gửi tin nhắn tới Chatbot Gemini ở Backend
 * @param {string} message - Nội dung tin nhắn từ người dùng
 * @param {number|string|null} userId - ID của người dùng (nếu có)
 * @param {string|null} currentCinema -
 */
export const sendMessageToChatbot = async (message, userId, currentCinema) => {
    try {
        // Kiểm tra nhanh đầu vào trước khi gửi đi
        if (!message || message.trim() === "") return null;

        const response = await chatbotClient.post('/ask', {
            message: message.trim(),
            userId: userId || null,
            currentCinema: currentCinema || null
        });

        // Backend của bạn trả về cấu trúc: { success: true, reply: "..." }
        if (response.data && response.data.success) {
            return response.data.reply;
        }

        return response.data.reply || "Dạ, tôi chưa nghe rõ, bạn nói lại được không?";

    } catch (error) {
        // Ghi log chi tiết để bạn dễ debug trong quá trình làm đồ án
        console.error("--- Chatbot API Error ---");
        if (error.response) {
            // Lỗi từ phía Server (500, 404, 400)
            console.error("Data:", error.response.data);
            console.error("Status:", error.response.status);
        } else if (error.request) {
            // Lỗi không kết nối được tới Server (Server chưa chạy hoặc sai PORT)
            console.error("No response received. Check if Backend is running on Port 5000");
        } else {
            console.error("Error Message:", error.message);
        }

        // Trả về câu thông báo lỗi thân thiện để hiển thị lên UI chatbot
        return "Dạ, hệ thống tư vấn của MTU Cinemas đang bận một chút, bạn vui lòng thử lại sau nhé!";
    }
};