import React from 'react';
import styles from '../Chatbot.module.css';
// 1. Import icon của bạn vào đây
import botIcon from '../../../assets/images/icon_chat.png';

const ChatMessage = ({ message }) => {
    const { text, sender } = message;
    const isBot = sender === 'bot';

    return (
        <div className={`${styles.messageWrapper} ${isBot ? styles.botWrapper : styles.userWrapper}`}>

            {/* 2. Thêm Icon tròn bên trái nếu là tin nhắn của Bot */}
            {isBot && (
                <div className={styles.avatarCircle}>
                    <img src={botIcon} alt="Bot" className={styles.avatarImg} />
                </div>
            )}

            <div className={`${styles.msgBubble} ${isBot ? styles.bot : styles.user}`}>
                {/* 3. Thêm tên "Trợ lý AI" như mẫu ảnh 2 */}
                {isBot && <div className={styles.botNameSmall}>Trợ lý AI</div>}

                <div className={styles.textContainer}>
                    {text}
                </div>

                <span className={styles.timestamp}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
};

export default React.memo(ChatMessage);