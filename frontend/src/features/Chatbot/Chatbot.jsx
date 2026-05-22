import React, { useState } from 'react';
import styles from './Chatbot.module.css';
import ChatWindow from './components/ChatWindow';
import { sendMessageToChatbot } from '../../api/chatbotApi'; //
import chatbotLogo from '../../assets/images/icon_chatbot.jpg';
const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false); // Trạng thái bot đang xử lý
    const [messages, setMessages] = useState([
        { text: "Chào bạn! MTU Cinemas có thể giúp gì cho bạn về lịch chiếu phim?", sender: 'bot' }
    ]);

    // Giả sử thông tin user được lưu trong localStorage sau khi đăng nhập
    const user = JSON.parse(localStorage.getItem('user')) || null; //

    const handleSendMessage = async (text) => {
        // 1. Cập nhật ngay tin nhắn của người dùng lên giao diện
        const userMsg = { text, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);

        // 2. Bật trạng thái bot đang gõ/đang xử lý
        setIsTyping(true);

        // 💡 BƯỚC THÊM MỚI: Lấy tên rạp từ localStorage
        const selectedCinemaString = localStorage.getItem('selectedCinema');
        const selectedCinemaData = selectedCinemaString ? JSON.parse(selectedCinemaString) : null;
        const currentCinemaName = selectedCinemaData ? selectedCinemaData.name : null;

        try {
            // 3. Gọi API thực tế đã cài đặt
            // 💡 TRUYỀN THÊM currentCinemaName VÀO HÀM NÀY
            const botResponse = await sendMessageToChatbot(text, user?.id, currentCinemaName);

            // 4. Thêm phản hồi của bot vào danh sách tin nhắn
            setMessages(prev => [...prev, {
                text: botResponse,
                sender: 'bot'
            }]);
        } catch (error) {
            console.error("Lỗi khi xử lý chatbot:", error);
        } finally {
            // 5. Tắt trạng thái đang gõ
            setIsTyping(false);
        }
    };

    return (
        <div className={styles.chatbotWrapper}>
            {/* Nút bấm tròn (Launcher) */}
            <button
                className={`${styles.launcher} ${isOpen ? styles.active : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? (
                    <span className={styles.closeIcon}>✕</span>
                ) : (
                    <img
                        src={chatbotLogo}
                        alt="Chatbot Icon"
                        className={styles.botIconImg}
                    />
                )}
            </button>

            {/* Cửa sổ Chat */}
            {isOpen && (
                <ChatWindow
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onClose={() => setIsOpen(false)}
                    isTyping={isTyping} // Truyền trạng thái typing vào ChatWindow
                />
            )}
        </div>
    );
};

export default Chatbot;