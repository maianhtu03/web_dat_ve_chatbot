import React from 'react';
import styles from './StaffTable.module.css';
import { ShieldCheck, Trash2, UserCog } from 'lucide-react';

const StaffTable = ({ data, onDelete, onAssign }) => {
    // Nếu không có dữ liệu, hiển thị thông báo thay vì để bảng trống
    if (!data || data.length === 0) {
        return <div className={styles.empty}>Chưa có nhân viên nào trong hệ thống.</div>;
    }

    return (
        <div className={styles.tableResponsive}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Rạp làm việc</th>
                        <th>Vai trò</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td>{item.fullName}</td>
                            <td>{item.email}</td>
                            <td>{item.phone || '---'}</td>
                            {/* Thay đổi dòng hiển thị rạp làm việc dưới đây */}
                            <td>
                                {item.cinemaName || 'Hệ thống'}
                            </td>
                            <td>
                                <span className={item.role === 'admin' ? styles.badgeAdmin : styles.badgeStaff}>
                                    {item.role.toUpperCase()}
                                </span>
                            </td>
                            <td className={styles.actions}>
                                <button
                                    className={styles.btnPermission}
                                    onClick={() => onAssign(item)}
                                    title="Phân quyền"
                                >
                                    <ShieldCheck size={16} />
                                    <span>Quyền</span>
                                </button>
                                <button
                                    className={styles.btnDelete}
                                    onClick={() => onDelete(item.id)}
                                    title="Xóa nhân viên"
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

export default StaffTable;