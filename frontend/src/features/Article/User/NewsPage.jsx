import React, { useState, useEffect } from 'react';
import articleApi from '../../../api/articleApi';
// 1. Import Navbar (Hãy kiểm tra lại đường dẫn cho chính xác với project của bạn)
import Navbar from '../../../components/Layout/Navbar/Navbar';
import Footer from '../../../components/Layout/Footer/Footer';
import styles from './NewsPage.module.css';
import { Calendar, Eye, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewsPage = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await articleApi.getAll();
                // Tùy vào cấu trúc API của bạn (thông thường là response.data.data hoặc response.data)
                const data = response.data.data || response.data;

                if (data) {
                    // Chỉ hiển thị bài viết có trạng thái là 1 (Active)
                    const activeArticles = data.filter(a => a.status === 1);
                    setArticles(activeArticles);
                }
            } catch (error) {
                console.error("Lỗi khi tải tin tức:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    // Hiển thị Navbar ngay cả khi đang loading để người dùng vẫn có thể quay lại trang khác
    if (loading) return (
        <>
            <Navbar />
            <div className={styles.loading}>Đang tải tin tức...</div>
        </>
    );

    return (
        <>
            {/* 2. Thêm Navbar ở đây */}
            <Navbar />

            <div className={styles.container}>
                <div className={styles.headerSection}>
                    <h1 className={styles.pageTitle}>Tin mới và Ưu đãi</h1>
                    <div className={styles.underline}></div>
                </div>

                <div className={styles.newsGrid}>
                    {articles.map((item) => (
                        <div key={item.id} className={styles.newsCard}>
                            <div className={styles.imageWrapper}>
                                <img
                                    src={`http://localhost:5000${item.thumbnail}`}
                                    alt={item.title}
                                    onError={(e) => { e.target.src = '/placeholder-news.png'; }}
                                />
                            </div>

                            <div className={styles.content}>
                                <div className={styles.meta}>
                                    <span><Calendar size={14} /> {new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
                                    <span><Eye size={14} /> {item.views || 0} lượt xem</span>
                                </div>

                                <h3 className={styles.title}>{item.title}</h3>
                                <p className={styles.description}>{item.short_description}</p>

                                {/* CHỈNH SỬA TẠI ĐÂY: Đường dẫn phải khớp với Route khai báo ở App.js */}
                                <Link to={`/tin-tuc/${item.slug}`} className={styles.readMoreBtn}>
                                    XEM CHI TIẾT <ChevronRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {articles.length === 0 && (
                    <div className={styles.empty}>Hiện chưa có tin mới nào.</div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default NewsPage;