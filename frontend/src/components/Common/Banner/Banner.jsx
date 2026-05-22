import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Info } from 'lucide-react';
// Import đúng file api của bạn
import bannerApi from '../../../api/bannerApi';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './Banner.module.css';

const Banner = () => {
    const navigate = useNavigate();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                // 1. Sửa tên hàm thành getAllBanners() cho khớp với file api của bạn
                const data = await bannerApi.getAllBanners();

                console.log("Dữ liệu từ bannerApi:", data);

                // 2. Vì hàm getAllBanners đã return response.data, nên ở đây data chính là {success, data: [...]}
                if (data && data.success) {
                    // Lọc những banner có status là "1"
                    const activeBanners = data.data.filter(b => String(b.status) === "1");
                    setBanners(activeBanners);
                }
            } catch (error) {
                console.error("Lỗi khi gọi bannerApi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    const handleAction = (item) => {
        switch (item.link_type) {
            case 'movie':
                if (item.target_id) {
                    navigate(`/movie/${item.target_id}`);
                }
                break;

            case 'article':
                // Nếu bạn lưu slug của bài viết vào target_id hoặc item có trường slug
                // Dựa trên ảnh của bạn: đường dẫn là /tin-tuc/slug-bai-viet
                if (item.target_id) {
                    navigate(`/tin-tuc/${item.target_id}`);
                }
                break;

            case 'external':
                if (item.external_url) {
                    window.open(item.external_url, '_blank');
                }
                break;

            default:
                console.warn("Loại liên kết không xác định hoặc không có mục tiêu:", item.link_type);
                break;
        }
    };

    if (loading || banners.length === 0) return null;

    return (
        <section className={styles.bannerContainer}>
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                navigation={true}
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={banners.length > 1}
                className={styles.mySwiper}
            >
                {banners.map((item) => (
                    <SwiperSlide key={item.id}>
                        {/* Thêm onClick vào đây để click vào ảnh là chuyển trang */}
                        <div className={styles.slideContent} onClick={() => handleAction(item)} style={{ cursor: 'pointer' }}>
                            <img
                                src={`http://localhost:5000${item.image_url}`}
                                alt={item.title}
                                className={styles.bannerImg}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/1920x600?text=MTU+Cinemas';
                                }}
                            />
                            <div className={styles.overlay}></div>

                            {/* Thêm phần nội dung và nút bấm để giống ảnh mẫu bạn gửi */}

                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default Banner;