import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import styles from './Login.module.css';
import Navbar from '../../components/Layout/Navbar/Navbar';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';

const Login = () => {
    // const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    // 1. Khai báo state lưu trữ lỗi
    const [errors, setErrors] = useState({});

    // 2. Hàm kiểm tra lỗi logic
    const validate = (name, value) => {
        let error = "";
        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) error = "Email không được để trống";
            else if (!emailRegex.test(value)) error = "Định dạng email không hợp lệ";
        }
        if (name === 'password') {
            if (!value) error = "Mật khẩu không được để trống";
            else if (value.length < 6) error = "Mật khẩu phải có ít nhất 6 ký tự";
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Validate ngay lập tức
        const errorMessage = validate(name, value);
        setErrors(prev => ({ ...prev, [name]: errorMessage }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra lỗi lần cuối trước khi gọi API
        const emailError = validate('email', formData.email);
        const passError = validate('password', formData.password);

        if (emailError || passError) {
            setErrors({ email: emailError, password: passError });
            return;
        }
        try {
            // Gọi API đăng nhập từ Backend
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
                email: formData.email,
                password: formData.password
            });

            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);
                const userData = response.data.user;
                localStorage.setItem('user', JSON.stringify(userData));

                alert("Đăng nhập thành công!");

                // SỬA TẠI ĐÂY: Dùng href để load lại toàn bộ app với quyền mới
                if (userData.role === 'admin' || userData.role === 'staff') {
                    window.location.href = '/admin/dashboard';
                } else {
                    const originPath = location.state?.from;
                    window.location.href = originPath || '/';
                }
            }
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            alert(error.response?.data?.message || "Email hoặc mật khẩu không đúng!");
        }
    };

    return (
        <div className={styles.pageContainer}>
            <Navbar />
            <div className={styles.loginWrapper}>
                <div className={styles.loginCard}>
                    <div className={styles.loginHeader}>Đăng nhập</div>

                    <form className={styles.loginBody} onSubmit={handleSubmit} noValidate>
                        {/* Email */}
                        <div className={styles.inputGroup}>
                            <label>Email</label>
                            <div className={`${styles.inputField} ${errors.email ? styles.errorBorder : ''}`}>
                                <User size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Nhập email"
                                    value={formData.email}
                                    onChange={handleChange}

                                />
                            </div>
                            <span className={styles.errorText}>{errors.email}</span>
                        </div>

                        {/* Mật khẩu */}
                        <div className={styles.inputGroup}>
                            <label>Mật khẩu</label>
                            <div className={`${styles.inputField} ${errors.password ? styles.errorBorder : ''}`}>
                                <Lock size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Nhập mật khẩu"
                                    value={formData.password}
                                    onChange={handleChange}

                                />
                                <div
                                    className={styles.eyeIcon}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </div>
                            </div>
                            <span className={styles.errorText}>{errors.password}</span>

                        </div>

                        <div className={styles.forgotPass}>
                            <Link to="/forgot-password">Quên mật khẩu?</Link>
                        </div>

                        <button type="submit" className={styles.btnPrimary}>
                            Đăng nhập bằng tài khoản
                        </button>

                        <button type="button" className={styles.btnGoogle}>
                            Đăng nhập bằng Google
                        </button>
                        <div className={styles.registerRedirect}>
                            Bạn chưa có tài khoản? <a href="/register">Tạo tài khoản</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;