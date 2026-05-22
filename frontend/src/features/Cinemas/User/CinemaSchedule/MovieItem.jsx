import React from 'react';
import styles from './CinemaSchedule.module.css';
import { useNavigate } from 'react-router-dom';
// Import các icon độ tuổi từ thư mục assets
import pIcon from '../../../../assets/images/p.png';
import kIcon from '../../../../assets/images/k.png';
import c13Icon from '../../../../assets/images/c-13.png';
import c16Icon from '../../../../assets/images/c-16.png';
import c18Icon from '../../../../assets/images/c-18.png';

const MovieItem = ({ movie, onShowtimeClick }) => {
    const BASE_URL = "http://localhost:5000";

    const navigate = useNavigate();
    const getImageUrl = (posterPath) => {
        if (!posterPath) return "https://via.placeholder.com/160x230?text=No+Image";
        return posterPath.startsWith('http') ? posterPath : `${BASE_URL}${posterPath}`;
    };

    // Hàm lấy icon tương ứng với độ tuổi
    const getRatingIcon = (rating) => {
        if (!rating) return pIcon;
        const r = rating.toUpperCase();
        if (r.includes('T18')) return c18Icon;
        if (r.includes('T16')) return c16Icon;
        if (r.includes('T13')) return c13Icon;
        if (r.includes('K')) return kIcon;
        if (r.includes('P')) return pIcon;
        return pIcon;
    };

    const handleMovieDetailClick = () => {
        // Điều hướng sang trang chi tiết phim theo id của phim (ví dụ: /movie/65f...)
        // Bạn hãy kiểm tra lại Route quy định trong App.js của bạn xem đường dẫn có phải là /movie/:id không nhé
        navigate(`/movie/${movie.movie_id}`);
    };

    const formatNames = Object.keys(movie.formats || {});

    return (
        <div className={styles.movieRow}>
            <div className={styles.moviePosterBlock}
                onClick={handleMovieDetailClick}
                style={{ cursor: 'pointer' }}
            >

                <img
                    src={getImageUrl(movie.poster)}
                    alt={movie.title}
                    className={styles.posterImg}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/160x230?text=Image+Error";
                    }}
                />
                {/* Thay hiển thị text bằng Image Icon */}
                <div className={styles.ageIconBadge}>
                    <img
                        src={getRatingIcon(movie.rating)}
                        alt={movie.rating}
                        style={{ width: '35px', display: 'block' }}
                    />
                </div>
            </div>

            <div className={styles.movieInfoBlock}>
                <h3 className={styles.movieTitle}
                    onClick={handleMovieDetailClick}
                    style={{ cursor: 'pointer' }}
                >{movie.title}</h3>
                <div className={styles.movieMeta}>
                    <span className={styles.genre}>{movie.genre}</span>
                    <span className={styles.metaSeparator}>|</span>
                    <span className={styles.duration}>{movie.duration} phút</span>
                </div>

                {formatNames.length > 0 ? (
                    formatNames.map(formatName => (
                        <div key={formatName} className={styles.formatGroup}>
                            <h4 className={styles.formatTitle}>{formatName}</h4>
                            <div className={styles.timeGrid}>
                                {movie.formats[formatName].map(st => (
                                    <button
                                        key={st.showtime_id}
                                        className={styles.timeButton}
                                        onClick={() => onShowtimeClick(st, movie)}
                                    >
                                        <span className={styles.timeText}>{st.start_time}</span>
                                        <span className={styles.seatsText}>{st.available_seats} ghế trống</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={styles.noShowtimes}>Đã hết suất chiếu trong ngày.</p>
                )}
            </div>
        </div>
    );
};

export default MovieItem;