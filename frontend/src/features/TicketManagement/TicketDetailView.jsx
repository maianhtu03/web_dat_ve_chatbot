import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import ticketApi from '../../api/ticketApi';
import styles from './TicketDetailView.module.css';
import { useReactToPrint } from 'react-to-print'; // 2. Đảm bảo đã install react-to-print
import TicketPrint from './TicketPrint';
const TicketDetailView = forwardRef(({ id, onDataLoaded }, ref) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);


    // SỬA: Khởi tạo null rõ ràng
    const printRef = useRef(null);

    // SỬA: Cập nhật cấu hình in để khớp với bản react-to-print mới
    const handlePrint = useReactToPrint({
        // Nếu dùng bản cũ thì để content: () => printRef.current
        // Nếu dùng bản mới (log báo contentRef) thì dùng như dưới:
        contentRef: printRef,
        documentTitle: `Ticket_${id}`,
    });

    useImperativeHandle(ref, () => ({
        triggerPrint: async () => {
            if (!data || !printRef.current) {
                alert("Dữ liệu in chưa sẵn sàng, vui lòng thử lại sau giây lát.");
                return;
            }

            // Van chặn an toàn: Vé đã in rồi thì cấm in lại
            if (data.is_printed === 1) {
                alert("Vé này đã được xuất/in trước đó! Không thể in lại.");
                return;
            }

            try {
                // Gọi API để cập nhật is_printed = 1 xuống Database
                const res = await ticketApi.checkInTicket(id);

                if (res.data.success) {
                    // Cập nhật State giao diện của file này
                    setData(prev => ({
                        ...prev,
                        is_printed: 1,
                        printed_at: new Date().toISOString()
                    }));

                    // Báo lên cho file Cha biết để khóa cái nút màu tím lại
                    if (onDataLoaded) {
                        onDataLoaded({ ...data, is_printed: 1 });
                    }

                    // Bật cửa sổ in của máy tính
                    handlePrint();
                }
            } catch (err) {
                alert(err.response?.data?.message || "Có lỗi xảy ra khi xác nhận vé!");
            }
        }
    }));
    useEffect(() => {
        const fetchDetail = async () => {
            // Log để kiểm tra ID truyền từ cha xuống
            console.log("ID nhận được tại View:", id);

            if (!id || id === 'undefined' || id === null) {
                console.warn("TicketDetailView: ID không hợp lệ.");
                setError("ID vé không hợp lệ hoặc không tìm thấy.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const res = await ticketApi.getTicketById(id);

                if (res && res.data) {
                    setData(res.data);
                    setError(null);
                    if (onDataLoaded) {
                        onDataLoaded(res.data);
                    }
                } else {
                    setError("Không tìm thấy dữ liệu vé trên hệ thống.");
                }
            } catch (err) {
                console.error("Lỗi API Chi tiết vé:", err);
                setError("Có lỗi xảy ra khi tải dữ liệu (500).");
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);


    const getStatusInfo = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid':
            case 'đã thanh toán':
                return { text: 'Đã thanh toán', class: styles.paid };
            case 'used':
            case 'đã sử dụng': // Trạng thái mới sau khi soát vé
                return { text: 'Đã sử dụng', class: styles.used };
            case 'pending':
            case 'chờ thanh toán':
                return { text: 'Chờ thanh toán', class: styles.pending };
            default:
                return { text: status || 'Chưa xác định', class: styles.otherStatus };
        }
    };

    // 1. Xử lý trạng thái đang tải
    if (loading) {
        return <div className={styles.loading}>Đang tải thông tin vé...</div>;
    }

    // 2. Xử lý trạng thái lỗi
    if (error) {
        return <div className={styles.errorCard}>{error}</div>;
    }

    // 3. Nếu không có dữ liệu
    if (!data) {
        return <div className={styles.errorCard}>Không có dữ liệu hiển thị.</div>;
    }

    const status = getStatusInfo(data.payment_status);
    // 4. Giao diện chính khi đã có data
    return (
        <div className={styles.detailGrid}>
            {/* Cột trái: Thông tin chính */}
            <div className={styles.leftColumn}>
                <div className={styles.movieCard}>
                    <img
                        src={`http://localhost:5000${data.poster_url?.startsWith('/') ? '' : '/'}${data.poster_url}`}
                        className={styles.mainPoster}
                        alt="poster"
                    />
                    <div className={styles.movieText}>
                        <h2 className={styles.title}>{data.title || data.movie_title}</h2>
                        <div className={styles.infoGrid}>
                            <p><strong>Thời lượng:</strong> {data.duration} Phút</p>
                            {/* BỔ SUNG: Độ tuổi (Giả sử bạn có trường rating hoặc mặc định) */}
                            <p><strong>Độ Tuổi:</strong> <span className={styles.ratingBadge}>{data.rating || 'T13'}</span></p>

                            {/* BỔ SUNG: Định dạng */}
                            <p><strong>Định Dạng:</strong> {data.movie_format || '2D Lồng Tiếng'}</p>

                            {/* BỔ SUNG: Thể loại */}
                            <p><strong>Thể Loại:</strong> {data.movie_genres || 'Hành động, Phiêu lưu'}</p>

                            {/* CẬP NHẬT: Lịch chiếu (Gộp Ngày và Giờ) */}
                            <p><strong>Lịch Chiếu:</strong> {data.start_time} ({new Date(data.show_date).toLocaleDateString('vi-VN')})</p>

                            {/* BỔ SUNG: Địa điểm */}
                            <p><strong>Địa Điểm:</strong> {data.cinema_name} - {data.room_name}</p>
                            <p><strong>Ghế:</strong> <span className={styles.seatLabels}>{data.seat_names}</span></p>
                            <p><strong>Suất chiếu:</strong> {data.start_time}</p>
                        </div>
                        <p className={styles.totalPrice}>Tổng tiền: {Number(data.total_price).toLocaleString()}đ</p>
                    </div>
                </div>

                {/* Phần Combo */}
                <div className={styles.comboCard}>
                    <h3 className={styles.sectionTitle}>Combo bắp nước</h3>
                    {data.combos && data.combos.length > 0 ? (
                        data.combos.map((c, i) => (
                            <div key={i} className={styles.comboItem}>
                                <img
                                    src={`http://localhost:5000${c.image?.startsWith('/') ? '' : '/'}${c.image}`}
                                    className={styles.comboImg}
                                    alt="combo"
                                />
                                <div className={styles.comboInfo}>
                                    <p className={styles.comboName}>{c.combo_name}</p>
                                    <p className={styles.comboQty}>Số lượng: {c.quantity}</p>
                                </div>
                                <p className={styles.comboPrice}>{(c.sale_price * c.quantity).toLocaleString()}đ</p>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noCombo}>Không mua kèm combo</p>
                    )}
                </div>
            </div>

            {/* Cột phải: QR & User */}
            <div className={styles.rightColumn}>
                <div className={styles.qrCard}>
                    <p className={styles.cardHeader}>Thông tin mã vé</p>
                    <div className={styles.qrWrapper}>
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.ticket_id || data.id}`}
                            alt="QR"
                        />
                    </div>
                    <p className={styles.ticketIdText}>{data.ticket_id || data.id}</p>
                    <p className={styles.qrNote}>* Quét mã này tại quầy để soát vé</p>
                </div>

                <div className={styles.statusCard}>
                    <p className={styles.cardHeader}>Chi tiết giao dịch</p>
                    <div className={styles.statusRow}>
                        <strong>Trạng thái:</strong>
                        <span className={`${styles.statusBadge} ${status.class}`}>
                            {status.text}
                        </span>
                    </div>
                    <div className={styles.statusRow} style={{ alignItems: 'flex-start', marginTop: '16px', marginBottom: '16px' }}>
                        <strong style={{ marginTop: '4px' }}>Kiểm soát:</strong>

                        <div className={styles.controlContainer}>
                            <span className={`${styles.controlBadge} ${data.is_printed === 1 ? styles.badgePrinted : styles.badgeNotPrinted}`}>
                                {data.is_printed === 1 ? '● ĐÃ XUẤT VÉ' : '● CHƯA SỬ DỤNG'}
                            </span>

                            {data.is_printed === 1 && data.printed_at && (
                                <span className={styles.printedTime}>
                                    Lúc: {new Date(data.printed_at).toLocaleString('vi-VN')}
                                </span>
                            )}
                        </div>
                    </div>
                    <p><strong>Phương thức:</strong> <span className={styles.methodText}>{data.payment_method || 'N/A'}</span></p>
                    <p><strong>Thời gian:</strong> {data.payment_date ?
                        new Date(data.payment_date).toLocaleString('vi-VN') :
                        new Date(data.created_at).toLocaleString('vi-VN')}
                    </p>
                </div>

                <div className={styles.userCard}>
                    <p className={styles.cardHeader}>Người đặt</p>
                    <div className={styles.userContent}>
                        <p><strong>Họ tên:</strong> {data.user_name}</p>
                        <p><strong>Email:</strong> {data.user_email}</p>
                        <p><strong>Số điện thoại:</strong> {data.user_phone || 'N/A'}</p>
                    </div>
                </div>
            </div>
            <TicketPrint ref={printRef} data={data} />
        </div>
    );
});

export default TicketDetailView;