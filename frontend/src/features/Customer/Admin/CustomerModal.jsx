import React, { useState, useEffect } from 'react';
import styles from './CustomerModal.module.css';

const CustomerModal = ({ isOpen, onClose, customer, onSave }) => {
    // Khởi tạo state dựa trên dữ liệu khách hàng được chọn
    const [formData, setFormData] = useState({
        id: '',
        fullName: '',
        tier_id: 1, // Mặc định là Standard (ID: 1)
        current_points: 0
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                id: customer.id,
                fullName: customer.fullName || '',
                tier_id: customer.tier_id || 1,
                current_points: customer.current_points || 0
            });
        }
    }, [customer]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        // Kiểm tra dữ liệu trước khi lưu
        if (!formData.fullName.trim()) {
            alert("Họ tên không được để trống");
            return;
        }
        onSave(formData);
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Chỉnh sửa thông tin hội viên</h3>
                    <button className={styles.btnClose} onClick={onClose}>&times;</button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label>Họ tên khách hàng</label>
                        <input
                            type="text"
                            className={styles.inputDisabled}
                            value={formData.fullName}
                            disabled // Thông thường không nên sửa tên khách hàng ở đây để đảm bảo tính nhất quán
                        />
                        <small>Họ tên được đồng bộ từ tài khoản người dùng</small>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Hạng thành viên</label>
                            <select
                                value={formData.tier_id}
                                onChange={(e) => setFormData({ ...formData, tier_id: parseInt(e.target.value) })}
                            >
                                {/* Giá trị value phải khớp với ID trong bảng membership_tiers ở DB */}
                                <option value={1}>Standard</option>
                                <option value={2}>VIP</option>
                                <option value={3}>VVIP</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Điểm tích lũy (P)</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.current_points}
                                onChange={(e) => setFormData({ ...formData, current_points: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.modalActions}>
                    <button className={styles.btnCancel} onClick={onClose}>Hủy bỏ</button>
                    <button className={styles.btnSave} onClick={handleSubmit}>Cập nhật thông tin</button>
                </div>
            </div>
        </div>
    );
};

export default CustomerModal;