import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './ShowtimeDetail.module.css';
import RoomSeatView from "../../../features/Rooms/Admin/RoomSeatView";

const ShowtimeDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Đây là showtimeId
    const [showtime, setShowtime] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShowtimeDetail = async () => {
            try {
                // Gọi API lấy chi tiết suất chiếu (bao gồm thông tin phim và phòng)
                const res = await axios.get(`http://localhost:5000/api/showtimes/${id}`);
                console.log("Data từ API:", res.data);
                setShowtime(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi tải chi tiết suất chiếu:", error);
                setLoading(false);
            }
        };
        fetchShowtimeDetail();
    }, [id]);

    if (loading) return <div className={styles.loading}>Đang tải...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>CHI TIẾT SUẤT CHIẾU #{id}</h2>
            </div>

            <div className={styles.mainContent}>
                {/* CỘT TRÁI: HIỂN THỊ SƠ ĐỒ GHẾ (70-75% chiều rộng) */}
                <div className={styles.leftColumn}>
                    <div className={styles.cardSeat}>
                        {/* QUAN TRỌNG: Truyền roomId lấy từ showtime và bật isReadOnly */}
                        {showtime?.room_id && (
                            <RoomSeatView
                                roomId={showtime.room_id}
                                isReadOnly={true}
                            />
                        )}
                    </div>
                </div>

                {/* CỘT PHẢI: THÔNG TIN PHIM & SUẤT CHIẾU (25-30% chiều rộng) */}
                <div className={styles.rightColumn}>
                    <div className={styles.infoCard}>
                        <h3>Thông tin phim</h3>
                        <div className={styles.movieDetail}>
                            {/* API trả về movie_title và genre */}
                            <p><strong>Tên phim:</strong> {showtime?.movie_title}</p>
                            <p><strong>Thể loại:</strong> {showtime?.genre}</p>
                            <p><strong>Định dạng:</strong> {showtime?.format || '2D Phụ Đề'}</p>
                        </div>
                    </div>

                    <div className={styles.infoCard}>
                        <h3>Thông tin suất chiếu</h3>
                        {/* API trả về branch_name thay vì cinema_name */}
                        <p><strong>Rạp:</strong> {showtime?.cinema_name}</p>
                        <p><strong>Phòng:</strong> {showtime?.room_name}</p>
                        <p><strong>Lịch chiếu:</strong> {showtime?.start_time?.slice(0, 5)} - {showtime?.end_time?.slice(0, 5)}</p>
                        {/* Format lại ngày từ 2026-04-07T... thành 07/04/2026 */}
                        <p><strong>Ngày chiếu:</strong> {showtime?.show_date ? new Date(showtime.show_date).toLocaleDateString('vi-VN') : '...'}</p>
                    </div>

                    <div className={styles.infoCard}>
                        <h3>Trạng thái ghế</h3>
                        <div className={styles.legend}>
                            <div className={styles.legendItem}>
                                <span className={`${styles.dot} ${styles.empty}`}></span> Ghế trống
                            </div>
                            <div className={styles.legendItem}>
                                <span className={`${styles.dot} ${styles.broken}`}></span> Ghế hỏng (X)
                            </div>
                            <div className={styles.legendItem}>
                                <span className={`${styles.dot} ${styles.sold}`}></span> Ghế đã bán
                            </div>
                        </div>
                    </div>

                    <button
                        className={styles.btnBackList}
                        onClick={() => navigate('/admin/showtimes')}
                    >
                        Danh sách suất chiếu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShowtimeDetail;