import React, { useState, useEffect } from 'react';
import styles from './SeatTemplateForm.module.css';

const SeatTemplateForm = ({ onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        total_rows: 0,
        total_cols: 0,
        normal_rows: 0,
        vip_rows: 0,
        couple_rows: 0,
        description: ''
    });

    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            if (initialData.matrix_size) {
                const [r, c] = initialData.matrix_size.split('x').map(Number);
                setFormData({
                    ...initialData,
                    total_rows: r,
                    total_cols: c,
                    // Đảm bảo các trường này là số để không bị lỗi khi cộng chuỗi
                    normal_rows: Number(initialData.normal_rows) || 0,
                    vip_rows: Number(initialData.vip_rows) || 0,
                    couple_rows: Number(initialData.couple_rows) || 0
                });
            }
        } else {
            // Reset form về mặc định nếu là thêm mới (tránh dính dữ liệu cũ)
            setFormData({
                name: '',
                total_rows: 0,
                total_cols: 0,
                normal_rows: 0,
                vip_rows: 0,
                couple_rows: 0,
                description: ''
            });
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Ép kiểu số để tính toán chính xác
        const totalRows = parseInt(formData.total_rows);
        const totalCols = parseInt(formData.total_cols);
        const n = parseInt(formData.normal_rows) || 0;
        const v = parseInt(formData.vip_rows) || 0;
        const c = parseInt(formData.couple_rows) || 0;

        if (totalRows <= 0 || totalCols <= 0) {
            return setError('Kích thước ma trận phải lớn hơn 0!');
        }

        const totalTypeRows = n + v + c;
        if (totalTypeRows !== totalRows) {
            return setError(`Tổng phân loại (${totalTypeRows}) phải khớp với Tổng hàng (${totalRows})!`);
        }

        setError('');

        // Gửi Object data hoàn chỉnh về cho SeatTemplateList.jsx gọi API
        onSubmit({
            ...formData,
            matrix_size: `${totalRows}x${totalCols}`, // Tạo lại chuỗi mới: "15x15"
            normal_rows: n,
            vip_rows: v,
            couple_rows: c
        });
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>{initialData ? 'Cập nhật' : 'Thêm'} Mẫu Sơ Đồ Ghế</h3>
                    <button className={styles.btnClose} onClick={onClose}>×</button>
                </div>

                {/* Thêm modalBody để xử lý cuộn nội dung */}
                <div className={styles.modalBody}>
                    <form id="seat-template-form" onSubmit={handleSubmit}>
                        {error && <div className={styles.errorAlert}>{error}</div>}

                        <div className={styles.formGroup}>
                            <label>Tên Mẫu Sơ Đồ Ghế</label>
                            <input
                                type="text"
                                required
                                placeholder="VD: Sơ đồ rạp số 1"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* TIÊU ĐỀ MA TRẬN GHẾ NHƯ BẠN YÊU CẦU */}
                        <p className={styles.sectionTitle}>Ma Trận Ghế</p>
                        <div className={`${styles.gridInputs} ${styles.matrixGrid}`}>
                            <div className={styles.formInputSmall}>
                                <label>Tổng số hàng</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={formData.total_rows}
                                    onChange={e => setFormData({ ...formData, total_rows: e.target.value })}
                                />
                            </div>
                            <div className={styles.formInputSmall}>
                                <label>Tổng số cột</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={formData.total_cols}
                                    onChange={e => setFormData({ ...formData, total_cols: e.target.value })}
                                />
                            </div>
                        </div>

                        <hr className={styles.divider} />

                        <p className={styles.sectionTitle}>Phân loại hàng ghế (Tổng phải bằng {formData.total_rows})</p>
                        <div className={styles.gridInputs}>
                            <div className={styles.formInputSmall}>
                                <label>Hàng Thường</label>
                                <input type="number" min="0" value={formData.normal_rows} onChange={e => setFormData({ ...formData, normal_rows: e.target.value })} />
                            </div>
                            <div className={styles.formInputSmall}>
                                <label>Hàng VIP</label>
                                <input type="number" min="0" value={formData.vip_rows} onChange={e => setFormData({ ...formData, vip_rows: e.target.value })} />
                            </div>
                            <div className={styles.formInputSmall}>
                                <label>Hàng Đôi</label>
                                <input type="number" min="0" value={formData.couple_rows} onChange={e => setFormData({ ...formData, couple_rows: e.target.value })} />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Mô tả</label>
                            <textarea
                                rows="2"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </form>
                </div>

                <div className={styles.modalFooter}>
                    <button type="button" onClick={onClose} className={styles.btnCancel}>Đóng</button>
                    {/* Kết nối nút với form thông qua ID */}
                    <button type="submit" form="seat-template-form" className={styles.btnSubmit}>
                        {initialData ? 'Cập nhật' : 'Khởi tạo mẫu'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SeatTemplateForm;