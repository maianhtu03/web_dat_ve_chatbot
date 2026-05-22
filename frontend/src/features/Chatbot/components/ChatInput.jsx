import React, { useState } from 'react';
import styles from '../Chatbot.module.css';

const ChatInput = ({ onSendMessage, disabled }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Chỉ gửi khi có chữ và không trong trạng thái disabled (đang đợi bot trả lời)
        if (text.trim() && !disabled) {
            onSendMessage(text.trim());
            setText(''); // Xóa ô input sau khi gửi
        }
    };

    // Hỗ trợ gửi tin nhắn bằng phím Enter (mặc định của form đã có, 
    // nhưng kiểm tra này giúp đảm bảo trải nghiệm người dùng)
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit(e);
        }
    };

    return (
        <form className={styles.inputForm} onSubmit={handleSubmit}>
            <input
                className={styles.inputField}
                type="text"
                placeholder={disabled ? "Đang chờ phản hồi..." : "Nhập tin nhắn..."}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled} // Khóa input khi bot đang trả lời
                autoComplete="off"
            />
            <button
                type="submit"
                className={`${styles.sendBtn} ${(!text.trim() || disabled) ? styles.disabledBtn : ''}`}
                disabled={!text.trim() || disabled}
            >
                ➤
            </button>
        </form>
    );
};

export default ChatInput;