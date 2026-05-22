
import React from 'react';
import styles from './SeatEditor.module.css'; // Dùng chung file css hoặc tạo mới

const SuccessModal = ({ onClose }) => (
    <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
            <div className={styles.successIcon}>✓</div>
            <h3>Thành công!</h3>
            <p>Thay Đổi Thành Công!</p>
            <button onClick={onClose} className={styles.btnOk}>OK</button>
        </div>
    </div>
);

export default SuccessModal;