import React from 'react';
import { Edit, Trash2, ToggleRight, ToggleLeft } from 'lucide-react';
import styles from './BannerTable.module.css';

const BannerTable = ({ banners, onEdit, onDelete, onToggleStatus }) => {
    return (
        <div className={styles.tableResponsive}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.colStt}>STT</th>
                        <th className={styles.colImage}>Hình ảnh</th>
                        <th className={styles.colTitle}>Tiêu đề</th>
                        <th className={styles.colType}>Loại liên kết</th>
                        <th className={styles.colStatus}>Trạng thái</th>
                        <th className={styles.colAction}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {banners.map((banner, index) => (
                        <tr key={banner.id}>
                            <td className={styles.colStt}>{index + 1}</td>
                            <td className={styles.colImage}>
                                <div className={styles.imgContainer}>
                                    <img
                                        src={`http://localhost:5000${banner.image_url}`}
                                        alt="banner"
                                        className={styles.bannerThumb}
                                        onError={(e) => {
                                            // Nếu ảnh lỗi, hiển thị một ảnh dự phòng để giao diện không bị xấu
                                            e.target.src = "https://via.placeholder.com/120x60?text=No+Image";
                                        }}
                                    />                                </div>
                            </td>
                            <td className={styles.colTitle}>
                                <span className={styles.titleText}>{banner.title}</span>
                            </td>
                            <td className={styles.colType}>
                                <span className={`${styles.typeBadge} ${styles[banner.link_type]}`}>
                                    {banner.link_type === 'movie' ? 'Phim' :
                                        banner.link_type === 'article' ? 'Bài viết' :
                                            banner.link_type === 'external' ? 'URL ngoài' : 'Không có'}
                                </span>
                            </td>
                            <td className={styles.colStatus}>
                                <div
                                    className={`${styles.toggleSwitch} ${(banner.status === 'active' || banner.status === 1 || banner.status === '1') ? styles.active : ''}`} onClick={() => onToggleStatus(banner.id)}
                                >
                                    <div className={styles.switchCircle}></div>
                                </div>
                            </td>
                            <td className={styles.colAction}>
                                <div className={styles.actions}>
                                    <button className={styles.btnEdit} title="Sửa" onClick={() => onEdit(banner)}>
                                        <Edit size={18} />
                                    </button>
                                    <button className={styles.btnDelete} title="Xóa" onClick={() => onDelete(banner.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BannerTable;