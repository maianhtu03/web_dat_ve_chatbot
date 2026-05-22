import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketApi from '../../api/ticketApi';
import styles from './AdminTicketTable.module.css';

const AdminTicketTable = ({ filters }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setLoading(true);
                // Gửi filters lên API - Đây là mấu chốt để lọc
                const res = await ticketApi.getAllTickets(filters);

                // Kiểm tra cấu trúc dữ liệu trả về để tránh lỗi .map()
                // Nếu BE trả về trực tiếp mảng thì dùng res.data
                // Nếu BE trả về { success: true, data: [] } thì dùng res.data.data
                const ticketData = res.data.data || res.data || [];
                setTickets(ticketData);
            } catch (err) {
                console.error("Lỗi lấy danh sách vé:", err);
                setTickets([]); // Reset về mảng rỗng nếu lỗi để không hỏng giao diện
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [filters]); // Chạy lại mỗi khi filter thay đổi

    return (
        <div className={styles.container}>
            {/* Header danh sách */}
            <div className={styles.tableHeader}>
                <span>Mã vé</span>
                <span className={styles.colSpan2}>Thông tin vé</span>
                <span>Hình ảnh</span>
                <span>Thông tin người đặt</span>
                <span className={styles.textRight}>Hành động</span>
            </div>

            {/* Danh sách các item */}
            <div className={styles.list}>
                {loading ? (
                    <div className={styles.loadingText}>Đang tải dữ liệu...</div>
                ) : tickets.length > 0 ? (
                    tickets.map((ticket) => (
                        <div key={ticket.ticket_id} className={styles.ticketCard}>
                            <span className={styles.ticketId}>{ticket.ticket_code || ticket.ticket_id}</span>

                            <div className={`${styles.ticketInfo} ${styles.colSpan2}`}>
                                <p className={styles.movieTitle}>{ticket.movie_title}</p>
                                <p className={styles.cinemaName}>{ticket.cinema_name}</p>
                                <p className={styles.showDate}>
                                    Ngày: {new Date(ticket.show_date).toLocaleDateString('vi-VN')} | {ticket.start_time}
                                </p>
                                <p>Ghế: <span className={styles.seatHighlight}>{ticket.seat_names}</span></p>
                                <span className={ticket.payment_status === 'paid' ? styles.statusPaid : styles.statusPending}>
                                    {ticket.payment_status === 'paid' ? 'Đã xuất vé' : 'Chờ thanh toán'}
                                </span>
                            </div>

                            <img
                                src={`http://localhost:5000${ticket.poster_url}`}
                                alt="poster"
                                className={styles.posterImg}
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150x200?text=No+Image'; }}
                            />

                            <div className={styles.userInfo}>
                                <p className={styles.userName}>{ticket.user_name}</p>
                                <p className={styles.userEmail}>{ticket.user_email}</p>
                                <span className={ticket.user_role === 'admin' ? styles.badgeAdmin : styles.badgeUser}>
                                    {ticket.user_role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                                </span>
                            </div>

                            <div className={styles.actions}>
                                <button
                                    onClick={() => {
                                        if (ticket.ticket_id) {
                                            navigate(`/admin/tickets/${ticket.ticket_id}`);
                                        } else {
                                            console.error("Dữ liệu vé không có ticket_id:", ticket);
                                        }
                                    }}
                                    className={styles.btnView}
                                    title="Xem chi tiết"
                                >
                                    <i className="fa-solid fa-circle-info" style={{ marginRight: '8px' }}></i>
                                    <span style={{ fontSize: '13px', fontWeight: '500' }}>Chi tiết</span>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.noDataText}>Không tìm thấy vé nào phù hợp.</div>
                )}
            </div>
        </div>
    );
};

export default AdminTicketTable;