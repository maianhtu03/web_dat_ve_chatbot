import React from 'react';
import { Edit, Trash2, Eye, Calendar, User } from 'lucide-react';
import styles from './ArticleTable.module.css';

const ArticleTable = ({ articles, onEdit, onDelete, onToggleStatus }) => {
    // 1. Cấu hình URL Backend tập trung
    const BASE_URL = 'http://localhost:5000';

    // 2. Hàm xử lý hiển thị ảnh thông minh hơn
    const renderThumbnail = (path) => {
        if (!path) return '/placeholder-news.png';
        if (path.startsWith('http')) return path;
        // Đảm bảo path có dấu gạch chéo ở đầu
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${BASE_URL}${cleanPath}`;
    };

    return (
        <div className={styles.tableResponsive}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th style={{ width: '50px' }}>#</th>
                        <th>Tiêu đề bài viết</th>
                        <th>Hình ảnh</th>
                        <th>Tác giả</th>
                        <th>Thống kê</th>
                        <th>Thời gian</th>
                        <th>Trạng thái</th>
                        <th style={{ textAlign: 'center' }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {articles && articles.length > 0 ? articles.map((item, index) => (
                        <tr key={item.id || index}>
                            <td>{index + 1}</td>
                            <td className={styles.titleColumn}>
                                <div className={styles.articleTitle} title={item.title}>
                                    {item.title}
                                </div>
                                <span className={styles.slugText}>{item.slug}</span>
                            </td>
                            <td>
                                <div className={styles.thumbWrapper}>
                                    <img
                                        src={renderThumbnail(item.thumbnail)}
                                        alt="thumbnail"
                                        className={styles.thumbnail}
                                        // Nếu ảnh từ server lỗi, hiện ảnh placeholder
                                        onError={(e) => { e.target.src = '/placeholder-news.png'; }}
                                    />
                                </div>
                            </td>
                            <td>
                                <div className={styles.infoRow}>
                                    <User size={14} />
                                    {/* Backend dùng author_name từ alias trong SQL */}
                                    <span>{item.author_name || 'Quản trị viên'}</span>
                                </div>
                            </td>
                            <td>
                                <div className={styles.infoRow}>
                                    <Eye size={14} />
                                    <span>{item.views?.toLocaleString() || 0} lượt xem</span>
                                </div>
                            </td>
                            <td>
                                <div className={styles.infoRow}>
                                    <Calendar size={14} />
                                    {/* QUAN TRỌNG: Đổi từ created_at thành createdAt để khớp với Database mới */}
                                    <span>
                                        {item.createdAt
                                            ? new Date(item.createdAt).toLocaleDateString('vi-VN')
                                            : 'Đang cập nhật'}
                                    </span>
                                </div>
                            </td>
                            <td>
                                <label className={styles.switch}>
                                    <input
                                        type="checkbox"
                                        checked={item.status === 1}
                                        onChange={() => onToggleStatus(item.id, item.status)}
                                    />
                                    <span className={styles.slider}></span>
                                </label>
                            </td>
                            <td className={styles.actions}>
                                <button
                                    onClick={() => onEdit(item)}
                                    className={styles.btnEdit}
                                    title="Chỉnh sửa bài viết"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => onDelete(item.id)}
                                    className={styles.btnDelete}
                                    title="Xóa bài viết"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="8" className={styles.empty}>
                                <div className={styles.emptyState}>
                                    <p>Không tìm thấy bài viết nào phù hợp.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ArticleTable;