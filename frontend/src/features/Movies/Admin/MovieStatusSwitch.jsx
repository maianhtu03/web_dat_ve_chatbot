import React from 'react';
import { movieApi } from '../../../api/movieApi';
import styles from './MovieStatusSwitch.module.css';

const MovieStatusSwitch = ({ movieId, currentStatus, onUpdate }) => {
    const toggleStatus = async () => {
        const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
        try {
            await movieApi.updateStatus(movieId, { status: newStatus });
            if (onUpdate) onUpdate(); // Load lại danh sách phim
        } catch (error) {
            // Đã sửa cảnh báo: Sử dụng biến error để in ra lỗi chi tiết
            console.error("Lỗi cập nhật trạng thái:", error.response?.data?.message || error.message);
            alert("Cập nhật trạng thái thất bại!");
        }
    };

    return (
        <label className={styles.switch}>
            <input
                type="checkbox"
                checked={currentStatus === 'Published'}
                onChange={toggleStatus}
            />
            <span className={styles.slider}></span>
        </label>
    );
};

export default MovieStatusSwitch;