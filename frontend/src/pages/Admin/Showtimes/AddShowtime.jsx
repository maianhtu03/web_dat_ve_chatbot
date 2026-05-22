import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ShowtimeForm from '../../../features/Showtimes/Admin/ShowtimeForm';
import showtimeApi from '../../../api/showtimeApi';
import styles from './ShowtimeManager.module.css'; // Dùng chung hoặc tạo file mới

const AddShowtime = () => {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const [activeTab, setActiveTab] = useState(isEditMode ? 'single' : 'multiple');
    const [initialData, setInitialData] = useState(null);
    useEffect(() => {
        if (isEditMode && id) {
            const fetchShowtime = async () => {
                try {
                    const res = await showtimeApi.getById(id);

                    // Kiểm tra dữ liệu trả về thực tế
                    console.log("Dữ liệu API trả về:", res);

                    // Nếu backend trả về thẳng object thì dùng res
                    // Nếu backend bọc trong một object có field data thì dùng res.data
                    // Thông thường với fetch của bạn ở showtimeApi.js thì dùng res là đúng
                    setInitialData(res);
                } catch (error) {
                    console.error("Lỗi lấy dữ liệu suất chiếu:", error);
                }
            };
            fetchShowtime();
        }
    }, [id, isEditMode]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div>
                        <h2>{isEditMode ? 'CHỈNH SỬA SUẤT CHIẾU' : 'THÊM MỚI SUẤT CHIẾU'}</h2>
                        Quản lý suất chiếu &gt; <span>{isEditMode ? 'Chỉnh sửa' : 'Thêm mới'}</span>
                    </div>
                </div>
            </div>
            {!isEditMode && (
                <div className={styles.tabContainer}>
                    <div
                        className={`${styles.tabItem} ${activeTab === 'multiple' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('multiple')}
                    >
                        + Thêm theo nhiều ngày
                    </div>
                    <div
                        className={`${styles.tabItem} ${activeTab === 'single' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('single')}
                    >
                        + Thêm theo ngày
                    </div>
                </div>
            )}
            <div className={styles.formWrapper}>
                {/* Truyền type vào Form để thay đổi các ô nhập liệu bên trong */}
                {(isEditMode && !initialData) ? (
                    <p>Đang tải dữ liệu...</p>
                ) : (
                    <ShowtimeForm
                        type={activeTab}
                        isEditMode={isEditMode}
                        showtimeId={id}
                        initialData={initialData} // TRUYỀN DỮ LIỆU VÀO ĐÂY
                    />
                )}
            </div>
        </div>
    );
};

export default AddShowtime;