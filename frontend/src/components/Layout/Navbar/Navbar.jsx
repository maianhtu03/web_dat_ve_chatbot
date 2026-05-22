import React, { useState } from 'react';
import styles from './Navbar.module.css';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../../assets/images/logo.png';
import LocationSelector from '../../../features/Branches/User/LocationSelector/LocationSelector';
import SearchMovie from "../../Common/SearchMovie/SearchMovie";
import { Menu, X } from 'lucide-react'; //
const Navbar = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // 1. Lấy thông tin user từ localStorage
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const selectedCinema = JSON.parse(localStorage.getItem('selectedCinema'));

    const handleBackToHome = (e) => {
        e.preventDefault();
        window.location.href = '/';
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert("Đã đăng xuất tài khoản!");
        navigate('/login');
        window.location.reload();
    };
    const closeMenu = () => setIsMenuOpen(false);

    const handleCinemaClick = (e) => {
        e.preventDefault();
        if (selectedCinema && selectedCinema.id) {
            navigate(`/cinema/${selectedCinema.id}`);
        } else {
            navigate('/rap');
        }
    };

    const handleMemberClick = (e) => {
        e.preventDefault();
        if (user) {
            navigate('/thanh-vien');
        } else {
            alert("Vui lòng đăng nhập để xem thông tin thành viên!");
            navigate('/login');
        }
    };

    const handlePriceClick = (e) => {
        e.preventDefault();
        if (selectedCinema && selectedCinema.id) {
            navigate(`/gia-ve/${selectedCinema.id}`);
        } else {
            alert("Vui lòng chọn rạp để xem giá vé!");
            navigate('/gia-ve');
        }
    };

    const handleScheduleClick = (e) => {
        e.preventDefault();
        if (selectedCinema && selectedCinema.id) {
            navigate(`/lich-chieu-theo-rap/${selectedCinema.id}`);
        } else {
            alert("Vui lòng chọn một rạp cụ thể để xem lịch chiếu!");
            navigate('/rap');
        }
    };

    return (
        <header className={styles.header}>
            {/* Top Bar xanh */}
            <div className={styles.topBar}>
                <div className={styles.container}>
                    <div className={styles.authLinks}>
                        {user ? (
                            /* --- PHẦN THAY ĐỔI: DROPDOWN TÊN USER --- */
                            <div className={styles.userDropdown}>
                                <span className={styles.welcomeText}>
                                    Chào, <strong>{user.fullName}</strong> <i className="fa fa-caret-down"></i>
                                </span>
                                <ul className={styles.dropdownContentTop}>
                                    {(user.role === 'admin' || user.role === 'staff' || user.isAdmin) && (
                                        <li className={styles.adminOption}>
                                            <Link to="/admin/dashboard">
                                                <i className="fa fa-lock"></i>
                                                <strong>{user.role === 'admin' ? ' Truy cập Trang Quản Trị' : ' Truy cập Trang Nhân Viên'}</strong>
                                            </Link>
                                        </li>
                                    )}
                                    <li><Link to="/thanh-vien?tab=account">Thông tin tài khoản</Link></li>
                                    <li><Link to="/thanh-vien?tab=card">Thẻ thành viên</Link></li>
                                    <li><Link to="/thanh-vien?tab=history">Hành trình điện ảnh</Link></li>
                                    <li><Link to="/thanh-vien?tab=points">Điểm Beta</Link></li>
                                    <li><Link to="/thanh-vien?tab=voucher">Voucher của tôi</Link></li>
                                    <li className={styles.logoutLi}>
                                        <button onClick={handleLogout}>Đăng xuất</button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <>
                                <Link to="/login">Đăng nhập</Link>
                                <span className={styles.divider}>|</span>
                                <Link to="/register">Đăng ký</Link>
                            </>
                        )}
                        <img src="https://flagcdn.com/w20/gb.png" alt="EN" className={styles.langIcon} />
                    </div>
                </div>
            </div>

            {/* Main Nav trắng */}
            <nav className={styles.mainNav}>
                <div className={styles.navContent}>
                    <div className={styles.leftGroup}>
                        <a href="/" onClick={handleBackToHome} className={styles.logo}>
                            <img src={logo} alt="Logo" />
                        </a>
                        <div className={styles.locationSelectorWrapper}>
                            <LocationSelector />
                        </div>

                    </div>
                    <div className={styles.searchContainer}>
                        <SearchMovie />
                    </div>
                    <button
                        className={styles.mobileMenuBtn}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                    <ul className={`${styles.menu} ${isMenuOpen ? styles.menuActive : ''}`}>
                        <li><a href="/lich-chieu-theo-rap" onClick={handleScheduleClick}>LỊCH CHIẾU THEO RẠP</a></li>
                        <li><Link to="/phim" onClick={closeMenu}>PHIM</Link></li>
                        <li><a href="/rap" onClick={handleCinemaClick}>RẠP</a></li>
                        <li><a href="/gia-ve" onClick={handlePriceClick}>GIÁ VÉ</a></li>
                        <li><Link to="/tin-moi-va-uu-dai" onClick={closeMenu}>ƯU ĐÃI</Link></li>
                        <li><a href="/thanh-vien" onClick={handleMemberClick}>THÀNH VIÊN</a></li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;