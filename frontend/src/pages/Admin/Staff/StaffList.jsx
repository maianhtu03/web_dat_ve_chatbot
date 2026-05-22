import React, { useState, useEffect, useCallback } from 'react';
import staffApi from '../../../api/staffApi';
import StaffTable from '../../../features/Staff/StaffTable';
import StaffForm from '../../../features/Staff/StaffForm';
import PermissionForm from '../../../features/Staff/PermissionForm';
import styles from './StaffList.module.css';
import { UserPlus, RefreshCw } from 'lucide-react';

const StaffList = () => {
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPermissionOpen, setIsPermissionOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Sử dụng useCallback để đồng bộ dữ liệu
    const fetchStaffs = useCallback(async () => {
        setLoading(true);
        try {
            // Nhờ Interceptor, 'res' lúc này chính là mảng data trực tiếp từ BE
            const data = await staffApi.getAllStaffs();
            setStaffs(Array.isArray(data) ? data : []);
        } catch (err) {
            // Lỗi đã được console.error ở interceptor, ở đây ta chỉ cần alert người dùng
            console.error("StaffList fetch error:", err);
            setStaffs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStaffs();
    }, [fetchStaffs]);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
            try {
                await staffApi.deleteStaff(id);
                // Sau khi xóa thành công, gọi lại danh sách
                fetchStaffs();
            } catch (err) {
                alert(err || "Lỗi: Không thể xóa nhân viên này!");
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Quản lý nhân viên hệ thống</h2>
                <div className={styles.actionButtons}>

                    <button className={styles.btnAdd} onClick={() => setIsFormOpen(true)}>
                        <UserPlus size={18} /> Thêm nhân viên
                    </button>
                </div>
            </div>

            {loading && staffs.length === 0 ? (
                <div className={styles.loading}>Đang tải dữ liệu nhân viên...</div>
            ) : (
                <StaffTable
                    data={staffs}
                    onDelete={handleDelete}
                    onAssign={(user) => {
                        setSelectedUser(user);
                        setIsPermissionOpen(true);
                    }}
                />
            )}

            {/* Modal thêm mới nhân viên */}
            {isFormOpen && (
                <StaffForm
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        fetchStaffs();
                    }}
                />
            )}

            {/* Modal phân quyền */}
            {isPermissionOpen && (
                <PermissionForm
                    user={selectedUser}
                    onClose={() => {
                        setIsPermissionOpen(false);
                        setSelectedUser(null);
                    }}
                    onSuccess={() => {
                        setIsPermissionOpen(false);
                        fetchStaffs();
                    }}
                />
            )}
        </div>
    );
};

export default StaffList;