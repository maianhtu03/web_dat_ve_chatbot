import React from 'react';
// Import VoucherTable để hiển thị danh sách ngay tại trang chủ quản lý
import VoucherTable from '../../../features/Voucher/Admin/VoucherTable';
import styles from './VoucherManagement.module.css';

const VoucherManagement = () => {
    return (
        <div className={styles.pageWrapper}>
            <div className={styles.headerTitle}>
                <h2>QUẢN LÝ MÃ GIẢM GIÁ</h2>
            </div>

            <div className={styles.divider}></div>

            {/* Hiển thị trực tiếp trang bảng (danh sách) */}
            <div className={styles.content}>
                <VoucherTable />
            </div>
        </div>
    );
};

export default VoucherManagement;