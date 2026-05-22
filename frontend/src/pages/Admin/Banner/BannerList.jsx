import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm useNavigate để đổi URL
import axios from 'axios';
import BannerTable from '../../../features/Banner/BannerTable';
import styles from './BannerList.module.css';

const BannerList = () => {
    const navigate = useNavigate(); // Hook để điều hướng
    const [banners, setBanners] = useState([]);

    // 1. Lấy danh sách Banner (Giữ nguyên logic của bạn)
    const fetchBanners = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/banners');
            if (res.data.success) {
                setBanners(res.data.data);
            }
        } catch (err) {
            console.error("Lỗi lấy danh sách banner:", err);
        }
    };

    // 2. Thay đổi cách mở Form: Chuyển sang điều hướng URL
    const handleAddClick = () => {
        // Thay vì setIsFormOpen(true), ta chuyển sang trang add
        navigate('/admin/banners/add');
    };

    const handleEditClick = (banner) => {
        // Chuyển sang trang edit với ID cụ thể
        navigate(`/admin/banners/edit/${banner.id}`);
    };

    // 3. Xóa Banner (Giữ nguyên)
    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa banner này?")) {
            try {
                await axios.delete(`http://localhost:5000/api/banners/${id}`);
                fetchBanners();
            } catch {
                alert("Lỗi khi xóa banner!");
            }
        }
    };

    // 4. Bật/Tắt trạng thái (Giữ nguyên)
    // 4. Bật/Tắt trạng thái (Đã sửa lỗi tham số và logic)
    const handleToggleStatus = async (id) => {
        try {
            // Tìm banner trong danh sách hiện tại để lấy status thực tế
            const banner = banners.find(b => b.id === id);
            if (!banner) return;

            // Đảo ngược trạng thái: Nếu đang 1 (hoặc 'active') thì gửi 0, ngược lại gửi 1
            const currentIsActive = (banner.status == 1 || banner.status === 'active');
            const nextStatus = currentIsActive ? 0 : 1;

            // Gọi API cập nhật
            const res = await axios.put(`http://localhost:5000/api/banners/${id}/status`, {
                status: nextStatus
            });

            if (res.data.success) {
                // Cập nhật State cục bộ để nút gạt đổi màu ngay lập tức (Rất quan trọng)
                setBanners(prevBanners =>
                    prevBanners.map(item =>
                        item.id === id ? { ...item, status: nextStatus } : item
                    )
                );
            }
        } catch (err) {
            console.error("Lỗi thay đổi trạng thái:", err);
            alert("Không thể cập nhật trạng thái!");
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Quản lý Banner Quảng Cáo</h2>
                {/* Luôn hiển thị nút thêm vì giờ nó là một trang riêng */}
                <button className={styles.btnAdd} onClick={handleAddClick}>
                    + Thêm Banner mới
                </button>
            </div>

            <div className={styles.contentSection}>
                {/* Luôn hiển thị bảng, không dùng toán tử tam phân nữa */}
                <BannerTable
                    banners={banners}
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                />
            </div>
        </div>
    );
};

export default BannerList;