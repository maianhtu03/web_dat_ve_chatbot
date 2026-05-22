import React from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import styles from './BookingModal.module.css';

const BookingModal = ({ movie, showtime, onClose }) => {
    const navigate = useNavigate();

    // Xử lý khi nhấn Đồng ý đặt vé
    const handleConfirm = () => {
        const token = localStorage.getItem('token');
        const path = `/booking/${showtime.showtime_id || showtime.id}`;

        if (!token) {
            // Chuyển hướng đăng nhập nếu chưa có token và lưu lại trang đích
            navigate('/login', { state: { from: path } });
        } else {
            navigate(path);
        }
    };

    if (!movie || !showtime) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
                {/* Nút đóng (X) */}
                <button className={styles.modalClose} onClick={onClose}>&times;</button>

                <h2 className={styles.modalHeading}>BẠN ĐANG ĐẶT VÉ XEM PHIM</h2>
                <h1 className={styles.modalMovieTitle}>{movie.title}</h1>

                {/* Bảng chi tiết thông tin suất chiếu */}
                <div className={styles.modalTable}>
                    <div className={styles.modalRow}>
                        <div className={styles.modalCol}><strong>Rạp chiếu</strong></div>
                        <div className={styles.modalCol}><strong>Ngày chiếu</strong></div>
                        <div className={styles.modalCol}><strong>Giờ chiếu</strong></div>
                    </div>
                    <div className={styles.modalRow}>
                        <div className={styles.modalCol}>
                            {showtime.cinema_name || 'Beta Hà Đông'}
                        </div>
                        <div className={styles.modalCol}>
                            {dayjs(showtime.show_date).format('DD/MM/YYYY')}
                        </div>
                        <div className={styles.modalCol}>
                            {showtime.start_time?.substring(0, 5)}
                        </div>
                    </div>
                </div>

                <p className={styles.modalNote}>Kiểm tra lại thông tin trước khi tiếp tục.</p>

                {/* Nút điều hướng */}
                <div className={styles.modalFooter}>
                    <button className={styles.btnCancel} onClick={onClose}>THOÁT</button>
                    <button className={styles.btnConfirm} onClick={handleConfirm}>ĐỒNG Ý</button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;