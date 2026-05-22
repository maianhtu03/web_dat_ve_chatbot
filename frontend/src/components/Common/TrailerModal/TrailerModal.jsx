import React from 'react';
import styles from './TrailerModal.module.css';

const TrailerModal = ({ trailerUrl, onClose }) => {
    if (!trailerUrl) return null;

    // Hàm chuyển đổi link Youtube sang link Embed để chạy được trong iframe
    const getEmbedUrl = (url) => {
        if (!url) return null;
        try {
            const cleanUrl = url.trim();
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = cleanUrl.match(regExp);

            // Trường hợp 1: Nếu là link YouTube đầy đủ
            if (match && match[2].length === 11) {
                return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
            }

            // Trường hợp 2: Nếu bạn chỉ nhập đúng 11 ký tự ID vào cột trailer_code
            if (cleanUrl.length === 11) {
                return `https://www.youtube.com/embed/${cleanUrl}?autoplay=1`;
            }

            return null;
        } catch {
            return null;
        }
    };

    const embedUrl = getEmbedUrl(trailerUrl);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.title}>TRAILER</h3>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>
                <div className={styles.videoBody}>
                    {embedUrl ? (
                        <iframe
                            src={embedUrl}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <p className={styles.error}>Link trailer không hợp lệ!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrailerModal;