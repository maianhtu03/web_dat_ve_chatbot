import React from 'react';
import HotMoviesSidebar from "../../Common/HotMoviesSidebar/HotMoviesSidebar"; // Giả sử bạn để ở Common
import styles from './SideBarLayout.module.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
const SideBarLayout = ({ children }) => {
    return (
        <div className={styles.wrapper}>
            <Navbar />
            <div className={styles.container}>
                {/* Nội dung bên trái: Thay đổi tùy trang (Rạp, Khuyến mãi...) */}
                <main className={styles.mainContent}>
                    {children}
                </main>

                {/* Cố định bên phải: Phim Hot */}
                <aside className={styles.sidebar}>
                    <HotMoviesSidebar />
                </aside>
            </div>
            <Footer />
        </div>
    );
};

export default SideBarLayout;