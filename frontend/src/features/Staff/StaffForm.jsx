import React, { useState, useEffect } from 'react';
import styles from './StaffForm.module.css';
import staffApi from '../../api/staffApi';

const StaffForm = ({ onClose, onSuccess }) => {
    const [cinemas, setCinemas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '', // Bổ sung trường số điện thoại theo DB
        password: '',
        cinema_id: '',
        role: 'staff'
    });

    // 1. Lấy danh sách rạp khi mở Form
    useEffect(() => {
        const fetchCinemas = async () => {
            try {
                // Nhờ Interceptor, res đã là mảng dữ liệu trực tiếp
                const data = await staffApi.getCinemasList();
                setCinemas(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Lỗi lấy danh sách rạp:", err);
            }
        };
        fetchCinemas();
    }, []);

    // 2. Xử lý thay đổi input tập trung
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 3. Gửi dữ liệu
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Gửi formData trực tiếp vì đã có cinema_id khớp với staffModel
            await staffApi.createStaff(formData);
            alert("Thêm nhân viên thành công!");
            onSuccess(); // Đóng modal và refresh danh sách ở trang cha
        } catch (err) {
            // err ở đây là chuỗi message lỗi đã được bóc tách từ Interceptor
            alert("Lỗi: " + err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h3>Thêm nhân viên mới</h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Họ và tên</label>
                        <input
                            name="fullName"
                            type="text"
                            placeholder="Nhập họ tên"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="example@gmail.com"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Số điện thoại</label>
                        <input
                            name="phone"
                            type="text"
                            placeholder="Nhập số điện thoại"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Mật khẩu</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Nhập mật khẩu"
                            required
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Rạp làm việc</label>
                        <select
                            name="cinema_id"
                            required
                            value={formData.cinema_id}
                            onChange={handleChange}
                        >
                            <option value="">-- Chọn rạp làm việc --</option>
                            {cinemas.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.btnCancel}
                            onClick={onClose}
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className={styles.btnSubmit}
                            disabled={loading}
                        >
                            {loading ? "Đang lưu..." : "Lưu tài khoản"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StaffForm;