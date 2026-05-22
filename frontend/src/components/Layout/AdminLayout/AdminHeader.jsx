import React, { useState } from 'react';
import styles from './AdminLayout.module.css';
import { useLocation } from 'react-router-dom';
import { QrCode, Menu } from 'lucide-react';

// Import Modal từ thư mục Common
import QRScannerModal from '../../Common/QRScannerModal/QRScannerModal';

const AdminHeader = ({ toggleSidebar }) => {

    const location = useLocation();

    // Logic 1: Quản lý trạng thái đóng/mở Modal quét mã
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // Logic 2: Lấy thông tin admin từ localStorage (Giữ nguyên cũ)
    const adminUser = JSON.parse(localStorage.getItem('user'));

    // Logic 3: Xử lý hiển thị breadcrumb/title (Tối ưu lại từ code cũ của bạn)
    const currentPath = location.pathname.split('/').pop() || 'DASHBOARD';
    const displayTitle = currentPath.replace(/-/g, ' ').toUpperCase();

    return (
        <>
            <header className={styles.adminHeader}>
                <div className={styles.headerLeft}>
                    <button className={styles.hamburgerBtn} onClick={toggleSidebar}>
                        <Menu size={24} />
                    </button>
                    <span>Hệ thống quản lý rạp phim / {displayTitle}</span>
                </div>

                <div className={styles.headerRight}>
                    {/* NÚT QUÉT MÃ QR - Chuyển từ navigate sang mở Modal */}
                    <button
                        className={styles.qrBtn}
                        onClick={() => setIsScannerOpen(true)}
                        title="Quét mã vé khách hàng"
                        type="button"
                    >
                        <QrCode size={22} />
                        <span>Quét mã QR</span>
                    </button>

                    <div className={styles.userInfo}>
                        <div className={styles.avatarPlaceholder}>
                            {adminUser?.fullName?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className={styles.userText}>
                            <strong>{adminUser?.fullName || 'Admin'}</strong>
                            <span>
                                {adminUser?.role === 'admin' ? '(Quản trị viên)' : '(Nhân viên)'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* MODAL QUÉT MÃ QR: Chỉ hiển thị khi nhấn nút trên */}
            <QRScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
            />
        </>
    );
};

export default AdminHeader;