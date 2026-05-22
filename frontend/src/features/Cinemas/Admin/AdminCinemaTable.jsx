import React from 'react';
import { Edit, Trash2, MapPin, Phone } from 'lucide-react';
import CinemaStatusSwitch from './CinemaStatusSwitch';
import styles from './AdminCinemaTable.module.css';

const BASE_URL = "http://localhost:5000";

const AdminCinemaTable = ({ cinemas, onEdit, onDelete, onStatusChange }) => {
    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Hình ảnh</th>
                    <th>Tên rạp</th>
                    <th>Chi nhánh</th>
                    <th>Thông tin liên hệ</th>
                    <th>Bản đồ</th>
                    <th>Hoạt động</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {cinemas.map((cinema, index) => (
                    <tr key={cinema.id}>
                        <td>{index + 1}</td>

                        {/* Cột Hình ảnh mới */}
                        <td className={styles.imageCell}>
                            {cinema.image_url ? (
                                <img
                                    src={`${BASE_URL}${cinema.image_url.startsWith('/') ? '' : '/'}${cinema.image_url}`}
                                    alt={cinema.name}
                                    className={styles.cinemaThumbnail}
                                    // Sửa đoạn này: Nếu lỗi thì xóa src đi để tránh lặp lại, hoặc thay bằng ảnh local
                                    onError={(e) => {
                                        e.target.onerror = null; // Ngăn vòng lặp vô tận
                                        e.target.src = 'https://placehold.co/80x50?text=No+Photo'; // Dùng domain khác ổn định hơn
                                    }}
                                />
                            ) : (
                                <div className={styles.noImagePlaceholder}>No Image</div>
                            )}
                        </td>

                        <td><strong>{cinema.name}</strong></td>

                        <td>
                            <span className={styles.branchBadge}>{cinema.branch_name}</span>
                        </td>

                        {/* Cột Hotline & Địa chỉ */}
                        <td className={styles.contactInfo}>
                            <div className={styles.infoItem}>
                                <Phone size={14} /> <span>{cinema.hotline || 'N/A'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <MapPin size={14} /> <span className={styles.addressText}>{cinema.address}</span>
                            </div>
                        </td>

                        {/* Cột Bản đồ (Xem nhanh) */}
                        <td>
                            {cinema.map_iframe ? (
                                <div
                                    className={styles.mapPreview}
                                    dangerouslySetInnerHTML={{ __html: cinema.map_iframe }}
                                    title="Xem bản đồ"
                                />
                            ) : (
                                <span className={styles.empty}>Chưa có Map</span>
                            )}
                        </td>

                        <td>
                            <CinemaStatusSwitch
                                id={cinema.id}
                                isActive={cinema.is_active}
                                onChange={onStatusChange}
                            />
                        </td>

                        <td className={styles.actions}>
                            <button onClick={() => onEdit(cinema)} className={styles.editBtn}>
                                <Edit size={16} />
                            </button>
                            <button onClick={() => onDelete(cinema.id)} className={styles.deleteBtn}>
                                <Trash2 size={16} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default AdminCinemaTable;