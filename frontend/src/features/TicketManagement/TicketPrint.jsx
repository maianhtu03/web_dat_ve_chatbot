import React, { forwardRef } from 'react';
import Barcode from 'react-barcode';
import styles from './TicketPrint.module.css';
import logoMtu from '../../assets/images/logo.png';
const TicketPrint = forwardRef(({ data }, ref) => {
    if (!data) return null;

    const seatArray = data.seat_names ? data.seat_names.split(',').map(s => s.trim()) : [];

    return (
        <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: -1, height: 0, overflow: 'hidden' }}>
            <div ref={ref} className={styles.printContainer}>
                {seatArray.map((seat, index) => (
                    <div key={index} className={styles.ticketPage}>
                        {/* Lề trái với Logo giả lập */}
                        <div className={styles.sideEdge}>
                            {[...Array(8)].map((_, i) => <img key={i} src={logoMtu} alt="Logo" className={styles.sideLogo} />)}
                        </div>

                        {/* Nội dung chính của vé */}
                        <div className={styles.mainContent}>
                            <div className={styles.header}>
                                <h2 className={styles.brand}>{data.cinema_name || "MTU CINEMA"}</h2>
                                <p className={styles.address}>{data.cinema_address || "Địa chỉ đang cập nhật"}</p>
                            </div>

                            <div className={styles.divider}>--------------------------------------------</div>
                            <h1 className={styles.ticketTitle}>VÉ XEM PHIM</h1>
                            <div className={styles.divider}>--------------------------------------------</div>

                            <div className={styles.infoGrid}>
                                <div className={styles.infoRow}>
                                    <span>Tên phim:</span>
                                    <strong className={styles.movieTitle}>{data.movie_title || data.title}</strong>
                                </div>
                                <div className={styles.infoRow}>
                                    <span>Ngày giờ:</span>
                                    <strong>{data.start_time} - {new Date(data.show_date).toLocaleDateString('vi-VN')}</strong>
                                </div>
                                <div className={styles.infoRow}>
                                    <span>Định dạng:</span>
                                    <strong>{data.movie_format || '2D Lồng Tiếng'}</strong>
                                </div>
                                <div className={styles.infoRow}>
                                    <span>Phòng chiếu:</span>
                                    <strong>{data.room_name}</strong>
                                </div>
                                <div className={styles.infoRow}>
                                    <span>Ghế ngồi:</span>
                                    <strong className={styles.seatName}>{seat}</strong>
                                </div>
                                <div className={styles.infoRow}>
                                    <span>Giá vé:</span>
                                    <strong>{(data.total_price / (seatArray.length || 1)).toLocaleString()} VND</strong>
                                </div>
                            </div>

                            <div className={styles.barcodeSection}>
                                <Barcode
                                    value={`${data.ticket_id || data.id}-${seat}`}
                                    width={1.2} // Giảm xuống 1.2 để thanh barcode không quá dài
                                    height={40}  // Giảm chiều cao barcode một chút
                                    fontSize={12}
                                    margin={0}
                                />
                            </div>

                            <div className={styles.footer}>
                                <p>Cảm ơn quý khách. Vé đã mua không đổi trả.</p>
                                <p>Hotline: 1900 xxxx</p>
                                <p className={styles.printTime}>Ngày in: {new Date().toLocaleString('vi-VN')}</p>
                            </div>
                        </div>

                        {/* Lề phải với Logo giả lập */}
                        <div className={styles.sideEdge}>
                            {[...Array(8)].map((_, i) => <img key={i} src={logoMtu} alt="Logo" className={styles.sideLogo} />)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default TicketPrint;