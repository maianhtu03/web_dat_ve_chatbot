import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MovieShowtimeModal.module.css';
import movieApi from "../../../api/movieApi";
import dayjs from 'dayjs';
import 'dayjs/locale/vi';


const isShowtimeValid = (showDate, startTime) => {
    const now = new Date();
    const showDateTime = new Date(`${dayjs(showDate).format('YYYY-MM-DD')}T${startTime}`);
    // Khóa trước 5 phút
    return (showDateTime.getTime() - now.getTime()) > (5 * 60 * 1000);
};
const MovieShowtimeModal = ({ movie, onClose }) => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [showtimes, setShowtimes] = useState([]);
    const [dates, setDates] = useState([]);

    // Thêm State để quản lý Modal xác nhận
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [activeShowtime, setActiveShowtime] = useState(null);

    const selectedCinema = JSON.parse(localStorage.getItem('selectedCinema'));

    useEffect(() => {
        const days = [];
        for (let i = 0; i < 7; i++) days.push(dayjs().add(i, 'day'));
        setDates(days);
    }, []);

    useEffect(() => {
        const fetchShowtimes = async () => {
            if (selectedCinema?.id && movie?.id) {
                try {
                    const res = await movieApi.getShowtimes({
                        movieId: movie.id,
                        cinemaId: selectedCinema.id,
                        date: selectedDate,
                        status: 'Active'
                    });
                    setShowtimes(res.data);
                } catch (err) {
                    console.error("Lỗi lấy suất chiếu:", err);
                }
            }
        };
        fetchShowtimes();
    }, [movie.id, selectedCinema?.id, selectedDate]);

    const groupedShowtimes = useMemo(() => {
        if (!showtimes || showtimes.length === 0) return {};

        const validShowtimes = showtimes.filter(st => isShowtimeValid(st.show_date, st.start_time));
        return validShowtimes.reduce((groups, st) => {
            let typeKey = st.room_type ? st.room_type.toUpperCase() : "2D";
            const versionName = st.format || "PHỤ ĐỀ";
            if (!groups[typeKey]) groups[typeKey] = {};
            if (!groups[typeKey][versionName]) groups[typeKey][versionName] = [];
            groups[typeKey][versionName].push(st);
            return groups;
        }, {});
    }, [showtimes]);

    // Hàm khi nhấn vào giờ chiếu: Mở Modal xác nhận thay vì chuyển trang ngay
    const handleTimeClick = (st) => {
        setActiveShowtime(st);
        setIsConfirmOpen(true);
    };

    // Hàm khi nhấn ĐỒNG Ý trong Modal xác nhận
    const handleConfirmBooking = () => {
        const token = localStorage.getItem('token');
        const bookingUrl = `/booking/${activeShowtime.id}`;
        if (!token) {
            navigate('/login', { state: { from: bookingUrl } });
        } else {
            navigate(bookingUrl);
        }
        onClose();
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>

                {/* --- GIAO DIỆN CHỌN SUẤT CHIẾU --- */}
                {!isConfirmOpen ? (
                    <>
                        <div className={styles.header}>
                            <div className={styles.headerTitle}>
                                <h3>LỊCH CHIẾU - {movie.title}</h3>
                                <span className={styles.cinemaName}>Rạp: {selectedCinema?.name}</span>
                            </div>
                            <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                        </div>

                        <div className={styles.dateSelector}>
                            {dates.map((date, index) => (
                                <div
                                    key={index}
                                    className={`${styles.dateItem} ${selectedDate === date.format('YYYY-MM-DD') ? styles.activeDate : ''}`}
                                    onClick={() => setSelectedDate(date.format('YYYY-MM-DD'))}
                                >
                                    <span className={styles.dateText}>{date.format('DD/MM')}</span>
                                    <span className={styles.dayText}>{index === 0 ? 'Hôm nay' : date.locale('vi').format('ddd')}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.showtimeContent}>
                            {Object.keys(groupedShowtimes).length > 0 ? (
                                Object.entries(groupedShowtimes).map(([typeName, versions]) => (
                                    <div key={typeName} className={styles.typeWrapper}>
                                        <h4 className={styles.typeTitle}>{typeName}</h4>
                                        {Object.entries(versions).map(([versionName, list]) => (
                                            <div key={versionName} className={styles.formatGroup}>
                                                <div className={styles.formatLabel}>{versionName.toUpperCase()}</div>
                                                <div className={styles.timeGrid}>
                                                    {list.map(st => (
                                                        <div key={st.id} className={styles.timeCard} onClick={() => handleTimeClick(st)}>
                                                            <div className={styles.timeValue}>{st.start_time?.substring(0, 5)}</div>
                                                            <div className={styles.roomName}>{st.room_name}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            ) : (
                                <div className={styles.noShowtimes}>Không có suất chiếu.</div>
                            )}
                        </div>
                    </>
                ) : (
                    /* --- GIAO DIỆN MODAL XÁC NHẬN (Bốc từ MovieDetail sang) --- */
                    <div className={styles.confirmContent}>
                        <button className={styles.modalClose} onClick={() => setIsConfirmOpen(false)}>&times;</button>
                        <h2 className={styles.modalHeading}>BẠN ĐANG ĐẶT VÉ XEM PHIM</h2>
                        <h1 className={styles.modalMovieTitle}>{movie.title}</h1>

                        <div className={styles.modalTable}>
                            <div className={styles.modalRow}>
                                <div className={styles.modalCol}><strong>Rạp chiếu</strong></div>
                                <div className={styles.modalCol}><strong>Ngày chiếu</strong></div>
                                <div className={styles.modalCol}><strong>Giờ chiếu</strong></div>
                            </div>
                            <div className={styles.modalRow}>
                                <div className={styles.modalCol}>{selectedCinema?.name}</div>
                                <div className={styles.modalCol}>{dayjs(activeShowtime.show_date).format('DD/MM/YYYY')}</div>
                                <div className={styles.modalCol}>{activeShowtime.start_time.substring(0, 5)}</div>
                            </div>
                        </div>

                        <p className={styles.modalNote}>Kiểm tra lại thông tin trước khi tiếp tục.</p>

                        <div className={styles.modalFooter}>
                            <button className={styles.btnCancel} onClick={() => setIsConfirmOpen(false)}>QUAY LẠI</button>
                            <button className={styles.btnConfirm} onClick={handleConfirmBooking}>ĐỒNG Ý</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieShowtimeModal;