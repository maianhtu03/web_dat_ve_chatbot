import React, { useRef, useEffect } from 'react';
import styles from '../Chatbot.module.css';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import botIcon from '../../../assets/images/icon_chat.png';
const ChatWindow = ({ messages, onSendMessage, onClose, isTyping }) => {
    const scrollRef = useRef(null);

    // Tự động cuộn xuống khi có tin nhắn mới hoặc khi bot đang gõ
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth' // Cuộn mượt mà thay vì nhảy ngay lập tức
            });
        }
    }, [messages, isTyping]);

    return (
        <div className={styles.windowContainer}>
            {/* Header chuẩn theo mẫu ảnh */}
            <div className={styles.header}>
                <div className={styles.headerInfo}>
                    <div className={styles.iconCircle}>
                        <img src={botIcon} alt="Bot Icon" className={styles.headerBotImg} />
                    </div>
                    <div className={styles.headerText}>
                        <div className={styles.botName}>Cinema Assistant</div>
                        <div className={styles.botStatus}>
                            <span className={styles.statusDot}></span>
                            Online
                        </div>
                    </div>
                </div>
                <button className={styles.closeBtn} onClick={onClose}>&times;</button>
            </div>

            {/* Danh sách tin nhắn */}
            <div className={styles.messageList} ref={scrollRef}>
                {messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                ))}

                {/* Hiệu ứng loading khi Bot đang xử lý câu trả lời */}
                {isTyping && (
                    <div className={`${styles.msgBubble} ${styles.bot} ${styles.typingAnim}`}>
                        <span>.</span><span>.</span><span>.</span>
                    </div>
                )}
            </div>

            {/* Ô nhập liệu - Vô hiệu hóa khi bot đang trả lời để tránh gửi dồn dập */}
            <ChatInput onSendMessage={onSendMessage} disabled={isTyping} />
        </div>
    );
};

export default ChatWindow;