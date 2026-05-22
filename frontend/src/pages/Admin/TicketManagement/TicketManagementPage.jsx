import React, { useState, useEffect } from 'react';
import AdminTicketTable from '../../../features/TicketManagement/AdminTicketTable';
import TicketFilterBar from '../../../features/TicketManagement/TicketFilterBar'; // Import FilterBar
import ticketApi from '../../../api/ticketApi';
import styles from './TicketManagement.module.css';

const TicketManagementPage = () => {
    const [options, setOptions] = useState({
        branches: [],
        cinemas: [],
        movies: []
    });
    // 1. Quản lý trạng thái bộ lọc
    const [filters, setFilters] = useState({
        branch: '',
        cinema: '',
        date: '',
        status: 'all',
        movie: '',
        search: ''
    });
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await ticketApi.getFilterOptions();
                // Vì Backend trả về { success: true, data: { branches, cinemas, movies } }
                if (res.data && res.data.success) {
                    setOptions(res.data.data);
                }
            } catch (error) {
                console.error("Lỗi lấy dữ liệu filter options:", error);
            }
        };
        fetchOptions();
    }, []);
    // 2. Hàm cập nhật khi người dùng thay đổi bộ lọc
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };
    const displayCinemas = filters.branch
        ? options.cinemas.filter(c => c.branch_id === parseInt(filters.branch))
        : options.cinemas;
    return (
        <div className={styles.pageWrapper}>
            <div className={styles.header}>
                <div className={styles.titleArea}>
                    <h1 className={styles.pageTitle}>Quản lý vé</h1>
                    <p className={styles.subTitle}>Hệ thống quản lý và kiểm tra vé đã thanh toán</p>
                </div>
                <nav className={styles.breadcrumb}>
                    Quản lý &gt; <span>Vé</span>
                </nav>
            </div>

            {/* 3. Hiển thị thanh lọc phía trên bảng */}
            <TicketFilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                branches={options.branches}
                movies={options.movies}
                cinemas={displayCinemas}
            />

            {/* 4. Truyền filters vào bảng để bảng biết mà load lại dữ liệu */}
            <AdminTicketTable filters={filters} />
        </div>
    );
};

export default TicketManagementPage;