import React, { useState, useEffect } from 'react';
import styles from './BranchForm.module.css';

const BranchForm = ({ isOpen, onClose, onSubmit, initialData }) => {
    // Chỉ giữ lại state cho name vì database không có cột address
    const [name, setName] = useState('');

    // Cập nhật giá trị khi mở Form để sửa hoặc reset khi thêm mới
    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || '');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Chỉ gửi trường name về cho BranchList xử lý API
        onSubmit({ name });
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{initialData ? 'Cập nhật chi nhánh' : 'Thêm chi nhánh mới'}</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Tên chi nhánh</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="VD: MTU Cinema Hà Nội"
                            autoFocus
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>
                            Hủy
                        </button>
                        <button type="submit" className={styles.submitBtn}>
                            {initialData ? 'Cập nhật' : 'Lưu lại'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BranchForm;