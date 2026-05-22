import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import styles from './CustomerTable.module.css';

const CustomerTable = ({ data, onEdit, onDelete, onToggleStatus, loadingId }) => {
    // Hiển thị thông báo khi không có dữ liệu
    if (!data || data.length === 0) {
        return <div className={styles.noData}>Không tìm thấy khách hàng nào.</div>;
    }

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Mã thành viên</th>
                        <th>Khách hàng</th>
                        <th>Hạng</th>
                        <th>Điểm hiện tại</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((customer) => (
                        <tr key={customer.id}>
                            {/* Mã thành viên từ bảng memberships */}
                            <td className={styles.memberCode}>
                                {customer.member_code || 'Chưa cấp'}
                            </td>

                            {/* Thông tin khách hàng */}
                            <td>
                                <div className={styles.userInfo}>
                                    <span className={styles.userName}>{customer.fullName}</span>
                                    <span className={styles.userEmail}>{customer.email}</span>
                                    {/* Sử dụng customer.phone để khớp với Model Backend */}
                                    {customer.phone && (
                                        <span className={styles.userPhone}>{customer.phone}</span>
                                    )}
                                </div>
                            </td>

                            {/* Hạng thành viên (Standard, VIP, VVIP) */}
                            <td>
                                <span className={`${styles.rankBadge} ${styles[customer.rank_name?.toLowerCase()] || styles.defaultRank}`}>
                                    {customer.rank_name || 'Standard'}
                                </span>
                            </td>

                            {/* Điểm tích lũy */}
                            <td className={styles.points}>
                                <strong>{(customer.current_points || 0).toLocaleString()}</strong> P
                            </td>

                            {/* Cột trạng thái với nút Toggle chuẩn */}
                            <td>
                                <div className={styles.statusContainer}>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            // Ép kiểu về Number để so sánh chính xác với giá trị từ DB (0/1)
                                            checked={Number(customer.is_active) === 1}
                                            // Khóa nút nếu hàng này đang được xử lý cập nhật
                                            disabled={loadingId === customer.id}
                                            onChange={() => onToggleStatus(customer)}
                                        />
                                        <span className={`${styles.slider} ${loadingId === customer.id ? styles.loading : ''}`}></span>
                                    </label>
                                    <span className={styles.statusLabel}>
                                        {Number(customer.is_active) === 1 ? 'Hoạt động' : 'Đã khóa'}
                                    </span>
                                </div>
                            </td>

                            {/* Các nút thao tác */}
                            <td className={styles.tableActions}>
                                <button
                                    className={styles.btnEdit}
                                    title="Chỉnh sửa thông tin/điểm"
                                    onClick={() => onEdit(customer)}
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    className={styles.btnDelete}
                                    title="Xóa khách hàng"
                                    onClick={() => onDelete(customer.id)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CustomerTable;