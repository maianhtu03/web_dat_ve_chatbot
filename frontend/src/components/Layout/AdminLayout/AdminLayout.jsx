import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    return (
        <div className={styles.layoutWrapper}>
            {/* Sidebar cố định bên trái */}
            {isSidebarOpen && (
                <div className={styles.overlay} onClick={toggleSidebar}></div>
            )}
            <Sidebar isOpen={isSidebarOpen} />

            {/* Khu vực bên phải chứa Header và Content */}
            <div className={styles.mainContent}>
                <AdminHeader toggleSidebar={toggleSidebar} />

                {/* Phần ruột thay đổi theo từng Route */}
                <main className={styles.contentBody}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;