import React, { useState } from 'react';
import styles from './MovieCard.module.css';
import iconTicket from '../../../assets/images/icon-ticket.png';
import { Link } from 'react-router-dom';

// Import các icon độ tuổi và hot
import MovieShowtimeModal from './MovieShowtimeModal';
import hotIcon from '../../../assets/images/hot.png';
import pIcon from '../../../assets/images/p.png';
import kIcon from '../../../assets/images/k.png';
import c13Icon from '../../../assets/images/c-13.png';
import c16Icon from '../../../assets/images/c-16.png';
import c18Icon from '../../../assets/images/c-18.png';

const MovieCard = ({ movie, onPlayClick }) => {
    const [showModal, setShowModal] = useState(false);
    // Địa chỉ Backend để hiển thị ảnh từ thư mục public/uploads
    const API_BASE_URL = "http://localhost:5000";

    const getAgeIcon = (rating) => {
        if (!rating) return null;

        // Chuẩn hóa: Viết hoa và xóa khoảng trắng (ví dụ: 't16 ' -> 'T16')
        const r = String(rating).toUpperCase().trim();

        switch (r) {
            case 'P':
                return pIcon;
            case 'K':
                return kIcon;
            case 'T13': // Khớp chính xác với "T13" trong DB của bạn
                return c13Icon;
            case 'T16': // Khớp chính xác với "T16" trong DB của bạn
                return c16Icon;
            case 'T18': // Khớp chính xác với "T18" trong DB của bạn
                return c18Icon;
            default:
                return null;
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.imageWrapper}>
                {/* 1. Sửa đường dẫn ảnh: Nối Base URL với path lưu trong DB */}
                <img
                    src={`${API_BASE_URL}${movie.poster}`}
                    alt={movie.title}
                    className={styles.poster}
                />

                {/* 2. Sửa thuộc tính: movie.rating thay vì ageRating (khớp model) */}
                {movie.rating && getAgeIcon(movie.rating) && (
                    <div className={styles.ageIcon}>
                        <img src={getAgeIcon(movie.rating)} alt="rating icon" />
                    </div>
                )}

                {/* 3. Sửa thuộc tính: movie.is_hot thay vì isHot (khớp model) */}
                {movie.is_hot === 1 && (
                    <div className={styles.hotIcon}>
                        <img src={hotIcon} alt="hot" />
                    </div>
                )}

                <div className={styles.overlay}> {/* Bỏ onClick ở đây */}
                    <div
                        className={styles.playButton}
                        onClick={(e) => {
                            e.stopPropagation(); // Ngăn sự kiện nổi bọt nếu có link bọc ngoài
                            onPlayClick();
                        }}
                    >
                        <div className={styles.playTriangle}></div>
                    </div>
                </div>
            </div>

            <div className={styles.info}>
                <Link to={`/movie/${movie.id}`} className={styles.titleLink}>
                    <h3 className={styles.title}>{movie.title}</h3>
                </Link>

                {/* 4. Sửa thuộc tính: movie.genre thay vì genres */}
                <p className={styles.meta}>
                    <strong>Thể loại:</strong> {movie.genre}
                </p>
                <p className={styles.meta}>
                    <strong>Thời lượng:</strong> {movie.duration} phút
                </p>

                <button
                    className={styles.btnBuy}
                    onClick={() => setShowModal(true)}
                >
                    <img src={iconTicket} alt="ticket" className={styles.ticketImg} />
                    MUA VÉ
                </button>
            </div>
            {showModal && (
                <MovieShowtimeModal
                    movie={movie}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default MovieCard;