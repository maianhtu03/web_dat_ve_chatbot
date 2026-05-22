import React from 'react';
import styles from './CinemaStatusSwitch.module.css';

/**
 * Component nút gạt thay đổi trạng thái rạp chiếu
 * @param {number} id - ID của rạp chiếu
 * @param {number} isActive - Trạng thái hiện tại (1: Hoạt động, 0: Tạm dừng)
 * @param {function} onChange - Hàm xử lý khi nhấn thay đổi
 */
const CinemaStatusSwitch = ({ id, isActive, onChange }) => {

    const handleToggle = (e) => {
        // Chuyển đổi boolean từ checkbox sang number (0 hoặc 1) để khớp với Database
        const newStatus = e.target.checked ? 1 : 0;
        onChange(id, newStatus);
    };

    return (
        <div className={styles.switchContainer}>
            <label className={styles.switch}>
                <input
                    type="checkbox"
                    checked={isActive === 1}
                    onChange={handleToggle}
                />
                <span className={`${styles.slider} ${styles.round}`}></span>
            </label>
            <span className={isActive === 1 ? styles.statusActive : styles.statusInactive}></span>
        </div>
    );
};

export default CinemaStatusSwitch;