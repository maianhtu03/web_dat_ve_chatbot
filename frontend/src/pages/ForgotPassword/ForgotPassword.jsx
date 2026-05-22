import React, { useState } from 'react';
import axios from 'axios';
import { Mail, ArrowLeft } from 'lucide-react';
import styles from "./ForgotPassword.module.css";
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Gọi API mà bạn vừa viết ở BE
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, { email });

            alert(response.data.message); // "Mật khẩu mới đã được gửi thành công..."
            navigate('/login'); // Gửi xong thì cho họ quay lại trang Đăng nhập
        } catch (error) {
            alert(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginWrapper}>
            <div className={styles.loginCard}>
                <div className={styles.loginHeader}>Quên mật khẩu</div>
                <form className={styles.loginBody} onSubmit={handleSubmit}>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                        Vui lòng nhập email đăng ký. Chúng tôi sẽ gửi mật khẩu mới vào hòm thư của bạn.
                    </p>

                    <div className={styles.inputGroup}>
                        <label>Email đăng ký</label>
                        <div className={styles.inputField}>
                            <Mail size={18} />
                            <input
                                type="email"
                                placeholder="example@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className={styles.btnPrimary} disabled={loading}>
                        {loading ? "Đang xử lý..." : "Gửi mật khẩu mới"}
                    </button>

                    <div className={styles.registerRedirect} style={{ marginTop: '20px' }}>
                        <ArrowLeft size={16} />
                        <a href="/login"> Quay lại Đăng nhập</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;