import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ArticleTable from '../../../features/Article/Admin/ArticleTable';
import articleApi from '../../../api/articleApi'; // Import file API tập trung
import styles from './ArticleManagement.module.css';
import { Plus, Search, Loader2 } from 'lucide-react';

const ArticleManagement = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // 1. Lấy danh sách bài viết từ API
    const fetchArticles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await articleApi.getAll();
            if (response.data.success) {
                setArticles(response.data.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách bài viết:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    // 2. Logic Tìm kiếm tại Local (Hoặc gọi API search nếu dữ liệu quá lớn)
    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.author_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 3. Xử lý xóa bài viết
    const handleDelete = async (id) => {
        if (window.confirm("Hành động này không thể hoàn tác. Bạn có chắc muốn xóa bài viết này?")) {
            try {
                const response = await articleApi.delete(id);
                if (response.data.success) {
                    setArticles(prev => prev.filter(a => a.id !== id));
                }
            } catch {
                alert("Không thể xóa bài viết. Vui lòng thử lại!");
            }
        }
    };

    // 4. Xử lý bật/tắt trạng thái (Active/Inactive)
    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 1 ? 0 : 1;
            const response = await articleApi.toggleStatus(id, newStatus);
            if (response.data.success) {
                // Cập nhật State cục bộ để giao diện mượt mà không cần reload
                setArticles(prev => prev.map(a =>
                    a.id === id ? { ...a, status: newStatus } : a
                ));
            }
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
        }
    };

    return (
        <div className={styles.container}>
            {/* 1. Tiêu đề trang đứng một mình */}
            <div className={styles.pageHeader}>
                <h1>Quản lý bài viết</h1>
                <p>Cập nhật tin tức, sự kiện và chương trình khuyến mãi cho khách hàng</p>
            </div>

            {/* 2. Dải công cụ: Bao gồm Search (Trái) và Nút Thêm (Phải) */}
            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <Search className={styles.searchIcon} size={16} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tiêu đề hoặc tác giả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* ĐÂY RỒI: Nút thêm mới đã được chuyển xuống đây */}
                <button
                    className={styles.btnAdd}
                    onClick={() => navigate('/admin/articles/add')}
                >
                    <Plus size={16} />
                    <span>Viết bài mới</span>
                </button>
            </div>

            {/* 3. Vùng hiển thị bảng */}
            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loadingArea}>
                        <Loader2 className={styles.spinner} size={20} />
                        <span>Đang tải dữ liệu bài viết...</span>
                    </div>
                ) : (
                    <ArticleTable
                        articles={filteredArticles}
                        onEdit={(item) => navigate(`/admin/articles/edit/${item.id}`)}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                    />
                )}

                {/* Footer thông số */}
                {!loading && (
                    <div className={styles.tableFooter}>
                        Hiển thị {filteredArticles.length} bài viết
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticleManagement;