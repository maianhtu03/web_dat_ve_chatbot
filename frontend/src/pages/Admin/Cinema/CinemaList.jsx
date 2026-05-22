import React, { useState, useEffect } from 'react';
import { getCinemas, createCinema, updateCinema, deleteCinema, updateCinemaStatus } from '../../../api/cinemaApi';
import AdminCinemaTable from '../../../features/Cinemas/Admin/AdminCinemaTable';
import CinemaForm from '../../../features/Cinemas/Admin/CinemaForm';
import styles from './CinemaList.module.css';

const CinemaList = () => {
    const [cinemas, setCinemas] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [currentCinema, setCurrentCinema] = useState(null);
    const [loading, setLoading] = useState(false);

    // Load danh sách rạp
    const loadCinemas = async () => {
        setLoading(true);
        try {
            const res = await getCinemas();
            setCinemas(res.data);
        } catch (error) {
            console.error("Lỗi khi load danh sách rạp:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCinemas();
    }, []);

    // Xử lý gửi Form (Data ở đây là FormData từ CinemaForm trả về)
    const handleFormSubmit = async (formData) => {
        try {
            if (currentCinema) {
                // Update rạp hiện tại
                await updateCinema(currentCinema.id, formData);
            } else {
                // Thêm mới rạp
                await createCinema(formData);
            }

            // Reset trạng thái sau khi thành công
            setIsFormVisible(false);
            setCurrentCinema(null);

            // Cập nhật lại danh sách ngay lập tức
            await loadCinemas();

        } catch (error) {
            // Hiển thị lỗi từ Backend nếu có (ví dụ: trùng tên, file quá lớn...)
            const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi lưu dữ liệu";
            alert(errorMsg);
        }
    };

    // NẾU ĐANG MỞ FORM (Thêm mới hoặc Sửa)
    if (isFormVisible || currentCinema) {
        return (
            <CinemaForm
                // Dùng key cực kỳ quan trọng để reset hoàn toàn state của Form khi chuyển từ Sửa sang Thêm
                key={currentCinema ? `edit-${currentCinema.id}` : 'new'}
                initialData={currentCinema}
                onClose={() => {
                    setIsFormVisible(false);
                    setCurrentCinema(null);
                }}
                onSubmit={handleFormSubmit}
            />
        );
    }

    // NẾU KHÔNG: Hiện bảng danh sách
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h2>Danh sách rạp chiếu</h2>
                </div>
                <button
                    className={styles.addBtn}
                    onClick={() => {
                        setCurrentCinema(null);
                        setIsFormVisible(true);
                    }}
                >
                    + Thêm Rạp chiếu
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>Đang tải dữ liệu...</div>
            ) : (
                <AdminCinemaTable
                    cinemas={cinemas}
                    onEdit={(c) => { setCurrentCinema(c); }}
                    onDelete={async (id) => {
                        if (window.confirm("Bạn có chắc muốn xóa rạp này? Hành động này không thể hoàn tác.")) {
                            try {
                                await deleteCinema(id);
                                await loadCinemas();
                            } catch {
                                alert("Không thể xóa rạp này. Có thể rạp đang có lịch chiếu.");
                            }
                        }
                    }}
                    onStatusChange={async (id, status) => {
                        try {
                            await updateCinemaStatus(id, status);
                            await loadCinemas();
                        } catch {
                            alert("Lỗi khi cập nhật trạng thái.");
                        }
                    }}
                />
            )}
        </div>
    );
};

export default CinemaList;