import React, { useState, useEffect } from 'react';
import styles from './MovieHistory.module.css';
import { bookingApi } from '../../../api/bookingApi';
import ticketApi from '../../../api/ticketApi'; // Import ticketApi của bạn

const MovieHistory = () => {
    const [journeyData, setJourneyData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFullJourney = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const userId = storedUser?.id || storedUser?.userId;

                if (!userId) {
                    setLoading(false);
                    return;
                }

                // 1. Lấy danh sách booking để lấy ID
                const response = await bookingApi.getBookingsByUserId(userId);
                const bookings = response.data?.data || [];
                const filteredBookings = bookings.filter(b => b.payment_status === 'paid');

                // 2. Lấy thông tin chi tiết từ ticketApi cho từng booking
                const fullData = await Promise.all(filteredBookings.map(async (booking) => {
                    try {
                        // Gọi API chi tiết vé - Nơi chứa đầy đủ thông tin chuẩn nhất
                        const res = await ticketApi.getTicketById(booking.id);
                        if (res && res.data) {
                            return res.data; // Trả về object chứa title, show_date, cinema_name...
                        }
                        return null;
                    } catch (err) {
                        console.error(`Lỗi fetch ticket ${booking.id}:`, err);
                        return null;
                    }
                }));

                setJourneyData(fullData.filter(item => item !== null));
            } catch (error) {
                console.error("Lỗi fetch hành trình:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFullJourney();
    }, []);

    // Hàm xử lý ngày để không bao giờ bị lệch 1 ngày

    if (loading) return <div className={styles.loading}>Đang tải hành trình điện ảnh...</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.mainTitle}>HÀNH TRÌNH ĐIỆN ẢNH</h2>
            <div className={styles.tableWrapper}>
                <table className={styles.historyTable}>
                    <thead>
                        <tr>
                            <th>MÃ HÓA ĐƠN</th>
                            <th>PHIM</th>
                            <th>RẠP CHIẾU</th>
                            <th>SUẤT CHIẾU</th>
                            <th>GHẾ ĐÃ ĐẶT</th>
                            <th>COMBO</th>
                            <th>NGÀY ĐẶT</th>
                            <th>ĐIỂM</th>
                        </tr>
                    </thead>
                    <tbody>
                        {journeyData.length > 0 ? (
                            journeyData.map((item) => (
                                <tr key={item.ticket_code || item.ticket_id || item.id}>
                                    <td className={styles.centerText}>{item.ticket_code || item.ticket_id || item.id}</td>
                                    <td>
                                        <div className={styles.movieCell}>
                                            <img
                                                src={`http://localhost:5000${item.poster_url?.startsWith('/') ? '' : '/'}${item.poster_url}`}
                                                alt="poster"
                                                className={styles.poster}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/100x150?text=No+Image'; }}
                                            />
                                            <div className={styles.movieText}>
                                                <span className={styles.movieTitle}>{item.title || item.movie_title}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.centerText}>
                                        {item.cinema_name} - {item.room_name}
                                    </td>

                                    {/* CỘT SUẤT CHIẾU ĐÃ FIX LỖI NGÀY */}
                                    <td className={styles.centerText}>
                                        <div style={{ fontWeight: 'bold', color: '#333' }}>
                                            {/* Fix trực tiếp bằng cách cộng T07:00:00 */}
                                            ({new Date(item.show_date).toLocaleDateString('vi-VN')})
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '4px' }}>
                                            {item.start_time?.substring(0, 5)}
                                        </div>
                                    </td>

                                    <td>
                                        <div className={styles.seatInfo}>
                                            <span className={styles.seatType}>{item.movie_format || '2D VIP'}</span>
                                            <span className={styles.seatList}>{item.seat_names}</span>
                                            <span className={styles.totalPrice}>
                                                Tổng: {Number(item.total_price).toLocaleString()}đ
                                            </span>
                                        </div>
                                    </td>

                                    <td className={styles.centerText}>
                                        {item.combos?.length > 0 ? item.combos.map(c => c.combo_name).join(', ') : '---'}
                                    </td>

                                    <td className={styles.centerText}>
                                        {/* Sử dụng toLocaleString và cấu hình định dạng 24h */}
                                        {item.payment_date || item.created_at ?
                                            new Date(item.payment_date || item.created_at).toLocaleString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: false // Dùng định dạng 24h (ví dụ 23:38)
                                            }).replace(',', '') // Loại bỏ dấu phẩy giữa ngày và giờ nếu có
                                            : '---'
                                        }
                                    </td>

                                    <td className={styles.pointsCell}>
                                        <div className={styles.plus}>
                                            {/* Ưu tiên dùng điểm thực tế từ DB, nếu không có mới dùng dự phòng */}
                                            + {Number(item.points_earned || (item.total_price * 0.03)).toLocaleString()} <small>đ</small>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className={styles.empty}>Bạn chưa có giao dịch nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MovieHistory;