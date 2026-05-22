import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SideBarLayout from "../../../components/Layout/SideBarLayout/SideBarLayout";
import styles from './ArticleDetailPage.module.css';
import { Calendar, Eye, ChevronLeft } from 'lucide-react';

const ArticleDetailPage = () => {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const BASE_URL = "http://localhost:5000";

    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${BASE_URL}/api/articles/slug/${slug}`);
                setArticle(res.data.data || res.data);
            } catch (error) {
                console.error("Lỗi lấy chi tiết bài viết:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [slug]);

    if (loading) return (
        <SideBarLayout>
            <div className={styles.loading}>Đang tải nội dung bài viết...</div>
        </SideBarLayout>
    );

    if (!article) return (
        <SideBarLayout>
            <div className={styles.error}>Không tìm thấy bài viết này.</div>
        </SideBarLayout>
    );

    return (
        <SideBarLayout>
            <div className={styles.container}>
                <div className={styles.articleHeader}>
                    <h1 className={styles.mainTitle}>{article.title}</h1>
                    <div className={styles.metaInfo}>
                        <span>
                            <Calendar size={16} />
                            {article.created_at ? new Date(article.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                        </span>
                        <span><Eye size={16} /> {article.views || 0} lượt xem</span>
                    </div>
                </div>

                {/* ẢNH BANNER BÀI VIẾT */}
                <div className={styles.bannerWrapper}>
                    <img
                        src={`${BASE_URL}${article.thumbnail}`}
                        alt={article.title}
                        className={styles.fullBanner}
                        onError={(e) => e.target.src = '/placeholder-news.png'}
                    />
                </div>

                <div className={styles.contentSection}>
                    {/* MÔ TẢ NGẮN (HIGHLIGHT) */}
                    <div className={styles.shortDesc}>
                        {article.short_description}
                    </div>

                    {/* NỘI DUNG CHI TIẾT (HTML TỪ EDITOR) */}
                    <div
                        className={styles.descriptionText}
                        dangerouslySetInnerHTML={{
                            __html: article.content ? article.content.replace(/&nbsp;/g, ' ') : ''
                        }}
                    />

                    {/* NÚT QUAY LẠI */}
                    <button className={styles.backBtn} onClick={() => navigate('/tin-moi-va-uu-dai')}>
                        <ChevronLeft size={20} /> QUAY LẠI DANH SÁCH
                    </button>
                </div>
            </div>
        </SideBarLayout>
    );
};

export default ArticleDetailPage;