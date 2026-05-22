import React, { useState, useEffect } from 'react';
import staffApi from '../../api/staffApi';
import styles from './PermissionForm.module.css';

const PermissionForm = ({ user, onClose, onSuccess }) => {
    const [permissions, setPermissions] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // 1. Lấy tất cả danh mục quyền có trong hệ thống
                const allPerms = await staffApi.getPermissions();
                setPermissions(allPerms);

                // 2. Lấy danh sách ID quyền mà user này đang có
                if (user.id) {
                    const currentPerms = await staffApi.getStaffPermissions(user.id);
                    // Map lại mảng ID để khớp với checkbox
                    const ids = currentPerms.map(p => p.permission_id);
                    setSelectedIds(ids);
                }
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu phân quyền:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [user]);

    const handleTogglePermission = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        setSelectedIds(permissions.map(p => p.id));
    };

    const handleDeselectAll = () => {
        setSelectedIds([]);
    };

    const handleSave = async () => {
        try {
            // Gửi mảng ID quyền lên Server
            await staffApi.assignPermissions(user.id, selectedIds);
            alert(`Cập nhật quyền thành công cho: ${user.fullName}`);

            // QUAN TRỌNG: Gọi onSuccess để cập nhật lại danh sách hoặc trạng thái app
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            alert("Lỗi lưu quyền: " + err.message);
        }
    };

    if (loading) return <div className={styles.loading}>Đang tải...</div>;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h3>Phân quyền: <span className={styles.highlight}>{user.fullName}</span></h3>
                </div>

                <div className={styles.permissionGrid}>
                    {permissions.map(p => (
                        <label key={p.id} className={styles.checkboxItem}>
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(p.id)}
                                onChange={() => handleTogglePermission(p.id)}
                            />
                            {/* Hiển thị tên quyền, nếu không có thì hiện mã code */}
                            <span>{p.permission_name || p.permission_code}</span>
                        </label>
                    ))}
                </div>

                <div className={styles.footerActions}>
                    <div className={styles.leftGroup}>
                        <button className={styles.btnSelectAll} onClick={handleSelectAll}>Chọn tất cả</button>
                        <button className={styles.btnDeselectAll} onClick={handleDeselectAll}>Hủy chọn</button>
                    </div>
                    <div className={styles.rightGroup}>
                        <button className={styles.btnCancel} onClick={onClose}>Đóng</button>
                        <button className={styles.btnSubmit} onClick={handleSave}>Lưu thay đổi</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PermissionForm;