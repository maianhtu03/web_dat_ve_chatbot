import React, { useState } from 'react';
import styles from './AccountInfo.module.css';

const AccountInfo = () => {
    // 1. Lấy dữ liệu gốc từ localStorage
    const storedUser = JSON.parse(localStorage.getItem('user')) || {};


    // 2. Tạo State để quản lý dữ liệu Form
    const [formData, setFormData] = useState({
        fullName: storedUser.fullName || "",
        phone: storedUser.phone || "",
        idCard: storedUser.idCard || "",
        birthday: storedUser.birthday || "",
        gender: storedUser.gender || "male",
        address: storedUser.address || "",
        email: storedUser.email || "" // Email dùng để định danh khi gửi API
    });
    const [showModal, setShowModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatToInputDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 3. Hàm xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value // value từ input type="date" mặc định đã là YYYY-MM-DD
        }));
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Xác nhận mật khẩu mới không khớp!");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                }),
            });

            const result = await response.json();
            if (response.ok) {
                alert("Đổi mật khẩu thành công!");
                setShowModal(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                alert("Lỗi: " + result.message);
            }
        } catch {
            alert("Không thể kết nối đến máy chủ!");
        }
    };

    // 4. Hàm gửi dữ liệu lên Backend
    const handleSubmit = async (e) => {
        e.preventDefault();

        // CHỈ BẮT BUỘC những thứ quan trọng nhất
        if (!formData.fullName.trim()) {
            alert("Họ tên không được để trống!");
            return;
        }
        if (!formData.phone.trim()) {
            alert("Số điện thoại không được để trống!");
            return;
        }

        // Các phần như idCard, address... KHÔNG CẦN CHECK !trim() nữa.
        // Nếu để trống, nó sẽ gửi chuỗi rỗng lên Database và lưu bình thường.

        try {
            const response = await fetch('http://localhost:5000/api/auth/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                // Cập nhật lại localStorage để hiển thị thông tin mới nhất
                localStorage.setItem('user', JSON.stringify(formData));
                alert("Cập nhật thông tin thành công!");
            } else {
                alert("Lỗi: " + result.message);
            }
        } catch (error) {
            console.error("Lỗi API:", error);
            alert("Không thể kết nối đến máy chủ!");
        }
    };

    return (
        <div className={styles.accountContainer}>
            <div className={styles.avatarSection}>
                <div className={styles.avatarPlaceholder}></div>
                <div className={styles.avatarActions}>
                    <button type="button" className={styles.btnUpload}>TẢI ẢNH LÊN</button>
                    <button type="button" className={styles.btnSave}>LƯU ẢNH</button>
                </div>
            </div>

            <form className={styles.infoForm} onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label><span>*</span> Họ tên</label>
                        <div className={styles.inputWithIcon}>
                            <i className="fas fa-user"></i>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Họ tên"
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label><span>*</span> Email</label>
                        <div className={styles.inputWithIcon}>
                            <i className="fas fa-envelope"></i>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className={styles.disabledInput}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label><span>*</span> Số điện thoại</label>
                        <div className={styles.inputWithIcon}>
                            <i className="fas fa-phone"></i>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Số điện thoại"
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label><span>*</span> CMND/Hộ chiếu</label>
                        <div className={styles.inputWithIcon}>
                            <i className="fas fa-id-card"></i>
                            <input
                                type="text"
                                name="idCard"
                                value={formData.idCard}
                                onChange={handleChange}
                                placeholder="CMND/Hộ chiếu"
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label><span>*</span> Ngày sinh</label>
                        <div className={styles.inputWithIcon}>
                            <i className="fas fa-calendar-alt"></i>
                            <input
                                type="text"
                                name="birthday"
                                value={formatDate(formData.birthday)}
                                onFocus={(e) => {
                                    e.target.type = 'date';
                                    e.target.value = formatToInputDate(formData.birthday);
                                }}
                                onBlur={(e) => {
                                    e.target.type = 'text';
                                    e.target.value = formatDate(formData.birthday);
                                }}
                                onChange={handleChange}
                                className={styles.dateInput}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Giới tính</label>
                        <div className={styles.inputWithIcon}>
                            <i className="fas fa-venus-mars"></i>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                            </select>
                        </div>
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label>Địa chỉ</label>
                        <div className={styles.inputWithIcon}>
                            <i className="fas fa-map-marker-alt"></i>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Địa chỉ"
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.formFooter}>
                    <button type="button" className={styles.btnForgot} onClick={() => setShowModal(true)}>
                        Đổi mật khẩu?
                    </button>
                    <button type="submit" className={styles.btnUpdate}>CẬP NHẬT</button>
                </div>

            </form>
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>ĐỔI MẬT KHẨU</h3>
                            <button type="button" className={styles.closeBtn} onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleChangePassword}>
                            <div className={styles.modalBody}>
                                <div className={styles.modalInputGroup}>
                                    <label>Mật khẩu cũ<span>*</span></label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    />
                                </div>
                                <div className={styles.modalInputGroup}>
                                    <label>Mật khẩu mới<span>*</span></label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    />
                                </div>
                                <div className={styles.modalInputGroup}>
                                    <label>Xác nhận lại<span>*</span></label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="submit" className={styles.btnSubmitPassword}>CẬP NHẬT</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountInfo;