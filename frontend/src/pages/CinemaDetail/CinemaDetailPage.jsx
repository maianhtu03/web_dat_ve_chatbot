import React from 'react';
import { useParams } from 'react-router-dom';
import CinemaSchedule from '../../features/Cinemas/User/CinemaSchedule/CinemaSchedule';
// Hãy kiểm tra lại đường dẫn import Navbar cho đúng với cấu trúc thư mục của bạn
import Navbar from '../../components/Layout/Navbar/Navbar';
import Footer from '../../components/Layout/Footer/Footer';
const CinemaDetailPage = () => {
    // Lấy id rạp từ URL (ví dụ: /cinema/65f...)
    const { id } = useParams();

    return (
        <div className="cinema-detail-page-wrapper">
            {/* 1. Thêm Navbar ở trên cùng của trang */}
            <Navbar />

            {/* 2. Container nội dung chính bên dưới Navbar */}
            <div className="cinema-detail-content" style={{ paddingBottom: '50px' }}>

                {/* Đã loại bỏ hoàn toàn phần Header màu xanh (background: '#00355a') */}

                <div className="container" style={{ marginTop: '30px' }}>
                    {/* 3. Hiển thị Lịch chiếu theo rạp */}
                    <CinemaSchedule cinemaId={id} />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CinemaDetailPage;