import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { FaFacebookF, FaYoutube, FaTiktok, FaInstagram } from 'react-icons/fa';
import logo from '../../../assets/images/logo.png';
import bocCongThuong from '../../../assets/images/bo-cong-thuong.png';
import cinemaApi from '../../../api/cinemaApi'; // Đường dẫn tới file api bạn vừa gửi
import { FaArrowUp } from 'react-icons/fa';
const Footer = () => {
    const [cinemas, setCinemas] = useState([]);
    const [showScroll, setShowScroll] = useState(false);
    useEffect(() => {
        const fetchCinemas = async () => {
            try {
                // SỬA TÊN HÀM: Từ getAllCinemas thành getAll theo đúng file cinemaApi.js
                const res = await cinemaApi.getAll();

                // Kiểm tra cấu trúc dữ liệu trả về
                if (res && res.data) {
                    // Nếu res.data là mảng thì dùng luôn, nếu là object {data: []} thì lấy res.data.data
                    const data = Array.isArray(res.data) ? res.data : res.data.data;
                    if (data) {
                        setCinemas(data.slice(0, 15)); // Lấy tối đa 15 rạp
                    }
                }
            } catch (error) {
                console.error("Lỗi lấy danh sách rạp tại Footer:", error);
            }
        };
        fetchCinemas();
    }, []);
    // Kiểm tra vị trí cuộn để ẩn/hiện nút
    useEffect(() => {
        const checkScrollTop = () => {
            if (!showScroll && window.pageYOffset > 400) {
                setShowScroll(true);
            } else if (showScroll && window.pageYOffset <= 400) {
                setShowScroll(false);
            }
        };

        window.addEventListener('scroll', checkScrollTop);
        return () => window.removeEventListener('scroll', checkScrollTop);
    }, [showScroll]);

    // Hàm xử lý cuộn lên đầu trang
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    const handleLogoClick = (e) => {
        e.preventDefault();
        window.location.href = '/'; // Ép trình duyệt tải lại trang chủ từ đầu
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* Cột 1: Logo & Thông tin chung */}
                <div className={styles.columnMain}>
                    <a href="/" onClick={handleLogoClick} className={styles.logoLink}>
                        <img src={logo} alt="MTU Cinemas" className={styles.logo} />
                    </a>
                    <ul className={styles.verticalList}>
                        <li>› Tuyển dụng</li>
                        <li>› Giới thiệu</li>
                        <li>› Liên hệ</li>
                        <li>› F.A.Q</li>
                        <li>› Điều khoản sử dụng</li>
                    </ul>
                    <div className={styles.appDownload}>
                        <h4>TẢI ỨNG DỤNG</h4>
                        <p>› MTU Cinemas cho iOS</p>
                        <p>› MTU Cinemas cho Android</p>
                    </div>
                </div>

                {/* Cột 2: Cụm rạp (Dữ liệu từ API) */}
                <div className={styles.columnCinemas}>
                    <h4 className={styles.columnTitle}>CỤM RẠP MTU</h4>
                    <div className={styles.cinemaGrid}>
                        {cinemas.length > 0 ? (
                            cinemas.map((cinema) => (
                                <Link
                                    to={`/cinema/${cinema.id}`}
                                    key={cinema.id}
                                    className={styles.cinemaItem}
                                >
                                    › {cinema.name}
                                </Link>
                            ))
                        ) : (
                            <p style={{ fontSize: '12px', opacity: 0.6 }}>Đang tải danh sách rạp...</p>
                        )}
                    </div>
                </div>

                {/* Cột 3: Liên hệ & Kết nối */}
                <div className={styles.columnContact}>
                    <h4 className={styles.columnTitle}>LIÊN HỆ</h4>
                    <div className={styles.companyInfo}>
                        <p><strong>CÔNG TY CỔ PHẦN MTU CINEMAS</strong></p>
                        <p>Giấy chứng nhận ĐKKD số: 0106633482</p>
                        <p>Địa chỉ: Tầng 3, số 595, đường Giải Phóng, Phường Giáp Bát, Quận Hoàng Mai, Hà Nội</p>
                        <p>Hotline: 1900 636807</p>
                        <p>Email: contact@mtucinemas.vn</p>
                    </div>

                    <h4 className={styles.columnTitle} style={{ marginTop: '30px' }}>KẾT NỐI VỚI CHÚNG TÔI</h4>
                    <div className={styles.socialGroup}>
                        <FaFacebookF /> <FaYoutube /> <FaTiktok /> <FaInstagram />
                    </div>

                    <div className={styles.verified}>
                        <img src={bocCongThuong} alt="Bộ Công Thương" />
                    </div>
                </div>
            </div>
            <div className={styles.copyright}>
                &copy; {new Date().getFullYear()} MTU Cinemas. All rights reserved.
            </div>
            <div
                className={`${styles.scrollTop} ${showScroll ? styles.show : ''}`}
                onClick={scrollToTop}
            >
                <FaArrowUp />
            </div>
        </footer>
    );
};

export default Footer;