import React, { useState } from 'react';
import { User, Mail, Lock, Calendar, Phone, Users, Eye, EyeOff } from 'lucide-react';
import Navbar from '../../components/Layout/Navbar/Navbar';
import styles from './Register.module.css';
import axios from 'axios';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false); // State cho ô mật khẩu
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State cho ô xác nhận
    // Khai báo State để quản lý dữ liệu form
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        birthday: '',
        gender: '',
        phone: '',
        agree: false
    });
    const [errors, setErrors] = useState({});

    // Hàm kiểm tra lỗi riêng biệt (Tránh viết chung trong handleChange để dễ debug)
    const validate = (name, value) => {
        let error = "";
        if (name === 'fullName' && !value.trim()) error = "Họ tên không được để trống";

        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) error = "Email là bắt buộc";
            else if (!emailRegex.test(value)) error = "Email không đúng định dạng";
        }

        if (name === 'password') {
            if (value.length < 6) error = "Mật khẩu phải từ 6 ký tự";
        }

        if (name === 'confirmPassword') {
            if (value !== formData.password) error = "Mật khẩu xác nhận không khớp";
        }

        if (name === 'phone') {
            const phoneRegex = /^\+?[0-9]{9,15}$/;
            if (!value) error = "Số điện thoại là bắt buộc";
            else if (!phoneRegex.test(value)) error = "Số điện thoại phải có 10 số";
        }

        if (name === 'agree' && !value) error = "Bạn cần đồng ý với điều khoản";

        return error;
    };

    // Hàm xử lý khi thay đổi giá trị input
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;
        setFormData({
            ...formData,
            [name]: fieldValue
        });
        // 2. Chạy logic kiểm tra lỗi cho chính ô (field) đang nhập
        const errorMessage = validate(name, fieldValue);

        // 3. Cập nhật thông báo lỗi vào state errors
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: errorMessage
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Kiểm tra lỗi lần cuối trước khi gửi
        let tempErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validate(key, formData[key]);
            if (error) tempErrors[key] = error;
        });

        if (Object.keys(tempErrors).length > 0) {
            setErrors(tempErrors);
            return;
        }
        try {
            // formData là Object chứa: fullName, email, password, birthday, gender, phone
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, formData);

            if (response.status === 201) {
                alert("Đăng ký thành công! Đang chuyển sang trang đăng nhập...");
                // Điều hướng người dùng sang trang Login (dùng useNavigate của react-router-dom)
            }
        } catch (error) {
            // Hiển thị lỗi từ Backend (ví dụ: "Email này đã được sử dụng!")
            alert(error.response?.data?.message || "Đăng ký thất bại!");
        }
    };

    return (
        <div className={styles.pageContainer}>
            <Navbar />
            <div className={styles.registerWrapper}>
                <div className={styles.registerCard}>
                    <div className={styles.registerHeader}>Đăng ký</div>

                    <form className={styles.registerBody} onSubmit={handleSubmit}>
                        <div className={styles.formGrid}>
                            {/* Họ tên */}
                            <div className={styles.inputGroup}>
                                <label><span>*</span>Họ tên</label>
                                <div className={`${styles.inputField} ${errors.fullName ? styles.errorBorder : ''}`}>
                                    <User size={16} />
                                    <input
                                        type="text"
                                        name="fullName"
                                        placeholder="Họ tên"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <span className={styles.errorText}>{errors.fullName}</span>
                            </div>

                            {/* Email */}
                            <div className={styles.inputGroup}>
                                <label><span>*</span>Email</label>
                                <div className={`${styles.inputField} ${errors.email ? styles.errorBorder : ''}`}>
                                    <Mail size={16} />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <span className={styles.errorText}>{errors.email}</span>
                            </div>

                            {/* Mật khẩu */}
                            <div className={styles.inputGroup}>
                                <label><span>*</span>Mật khẩu</label>
                                <div className={`${styles.inputField} ${errors.password ? styles.errorBorder : ''}`}>
                                    <Lock size={16} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Mật khẩu"
                                        value={formData.password}
                                        onChange={handleChange}

                                    />
                                    <div className={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </div>
                                </div>
                                <span className={styles.errorText}>{errors.password}</span>
                            </div>

                            {/* Xác nhận mật khẩu */}
                            <div className={styles.inputGroup}>
                                <label><span>*</span>Xác nhận lại mật khẩu</label>
                                <div className={`${styles.inputField} ${errors.confirmPassword ? styles.errorBorder : ''}`}>
                                    <Lock size={16} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Xác nhận lại mật khẩu"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}

                                    />
                                    <div className={styles.eyeIcon} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </div>
                                </div>
                                <span className={styles.errorText}>{errors.confirmPassword}</span>
                            </div>

                            {/* Ngày sinh */}
                            <div className={styles.inputGroup}>
                                <label><span>*</span>Ngày sinh</label>
                                <div className={styles.inputField}>
                                    <Calendar size={16} />
                                    <input
                                        type="date"
                                        name="birthday"
                                        value={formData.birthday}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Giới tính */}
                            <div className={styles.inputGroup}>
                                <label>Giới tính</label>
                                <div className={styles.inputField}>
                                    <Users size={16} />
                                    <select name="gender" value={formData.gender} onChange={handleChange}>
                                        <option value="">Giới tính</option>
                                        <option value="male">Nam</option>
                                        <option value="female">Nữ</option>
                                    </select>
                                </div>
                            </div>

                            {/* Số điện thoại */}
                            <div className={styles.inputGroup}>
                                <label><span>*</span>Số điện thoại</label>
                                <div className={`${styles.inputField} ${errors.phone ? styles.errorBorder : ''}`}>
                                    <Phone size={16} />
                                    <input
                                        type="text"
                                        name="phone"
                                        placeholder="Số điện thoại"
                                        value={formData.phone}
                                        onChange={handleChange}

                                    />
                                </div>
                                <span className={styles.errorText}>{errors.phone}</span>
                            </div>
                        </div>

                        {/* Điều khoản */}
                        <div className={styles.checkboxGroup}>
                            <input
                                type="checkbox"
                                id="agree"
                                name="agree"
                                checked={formData.agree}
                                onChange={handleChange}
                            />
                            <label htmlFor="agree">
                                Tôi cam kết tuân theo <a href="#">chính sách bảo mật</a> và <a href="#">điều khoản sử dụng</a> của MTU Cinemas.
                            </label>
                            <span className={styles.errorText}>{errors.agree}</span>
                        </div>
                        <div className={styles.btnActionGroup}>
                            <button type="submit" className={styles.btnPrimary}>Đăng ký</button>
                            <button type="button" className={styles.btnGoogle}>Tiếp tục với Google</button>
                        </div>
                        <div className={styles.loginRedirect}>
                            Đã có tài khoản? <a href="/login">Đăng nhập</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;