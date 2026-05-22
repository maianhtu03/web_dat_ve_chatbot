import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import showtimeApi from '../../../api/showtimeApi';
import AdminShowtimeTable from '../../../features/Showtimes/Admin/AdminShowtimeTable';
import AdminShowtimeFilter from '../../../features/Showtimes/Admin/AdminShowtimeFilter';
import styles from './ShowtimeManager.module.css';

const ShowtimeManager = () => {
    const navigate = useNavigate();
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    // Lưu lại filter hiện tại để dùng cho việc reload
    const [currentFilters, setCurrentFilters] = useState({});

    const fetchShowtimes = useCallback(async (filters = {}) => {
        try {
            setLoading(true);
            // Cập nhật state filter hiện tại
            setCurrentFilters(filters);

            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([, v]) => v !== '' && v !== null)
            );

            const res = await showtimeApi.getAll(cleanFilters);
            console.log("Dữ liệu API trả về:", res);

            // Sửa lại để linh hoạt với cấu trúc trả về của Backend
            const actualData = res.data ? res.data : res;
            setShowtimes(Array.isArray(actualData) ? actualData : []);

        } catch (error) {
            console.error("Lỗi khi lấy danh sách suất chiếu:", error);
            setShowtimes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchShowtimes();
    }, [fetchShowtimes]);

    const handleFilter = (filters) => {
        fetchShowtimes(filters);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2>QUẢN LÝ SUẤT CHIẾU</h2>
                    <p className={styles.breadcrumb}>Quản lý &gt; <span>Quản lý suất chiếu</span></p>
                </div>
            </div>

            <div className={styles.contentCard}>
                <div className={styles.topActions}>
                    <AdminShowtimeFilter onFilter={handleFilter} />

                    <button
                        className={styles.btnAdd}
                        onClick={() => navigate('/admin/showtimes/add')}
                    >
                        + Thêm
                    </button>
                </div>

                {loading ? (
                    <div className={styles.loading}>Đang tải dữ liệu...</div>
                ) : (
                    <AdminShowtimeTable
                        data={showtimes}
                        // Reload lại với đúng filter đang chọn thay vì reset về rỗng
                        onReload={() => fetchShowtimes(currentFilters)}
                    />
                )}
            </div>
        </div>
    );
};

export default ShowtimeManager;