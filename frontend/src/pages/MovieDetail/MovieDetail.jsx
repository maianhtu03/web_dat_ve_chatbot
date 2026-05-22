import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import movieApi from "../../api/movieApi";
import styles from './MovieDetail.module.css';
import Navbar from '../../components/Layout/Navbar/Navbar';
import Footer from '../../components/Layout/Footer/Footer';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

import pIcon from '../../assets/images/p.png';
import kIcon from '../../assets/images/k.png';
import c13Icon from '../../assets/images/c-13.png';
import c16Icon from '../../assets/images/c-16.png';
import c18Icon from '../../assets/images/c-18.png';

const isShowtimeValid = (showDate, startTime) => {
    const now = new Date();
    // Tạo mốc thời gian của suất chiếu (YYYY-MM-DD + HH:mm)
    const showDateTime = new Date(`${dayjs(showDate).format('YYYY-MM-DD')}T${startTime}`);
    // Khóa trước 5 phút
    return (showDateTime.getTime() - now.getTime()) > (5 * 60 * 1000);
};
const MovieDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [dates, setDates] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeShowtime, setActiveShowtime] = useState(null);

    // --- HÀM XỬ LÝ LINK YOUTUBE (THÊM MỚI) ---
    const getEmbedUrl = (url) => {
        if (!url) return null;
        try {
            const cleanUrl = url.trim();
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = cleanUrl.match(regExp);
            if (match && match[2].length === 11) {
                return `https://www.youtube.com/embed/${match[2]}`;
            }
            if (cleanUrl.length === 11) {
                return `https://www.youtube.com/embed/${cleanUrl}`;
            }
            return null;
        } catch {
            return null;
        }
    };

    const getAgeIcon = (rating) => {
        if (!rating) return null;
        const r = String(rating).toUpperCase().trim();
        switch (r) {
            case 'P': return pIcon;
            case 'K': return kIcon;
            case 'T13': return c13Icon;
            case 'T16': return c16Icon;
            case 'T18': return c18Icon;
            default: return null;
        }
    };

    const selectedCinema = JSON.parse(localStorage.getItem('selectedCinema'));

    useEffect(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push(dayjs().add(i, 'day'));
        }
        setDates(days);
    }, []);

    useEffect(() => {
        const getMovieData = async () => {
            try {
                const res = await movieApi.getMovieById(id);
                setMovie(res.data);
            } catch (err) {
                console.error("Không tìm thấy phim:", err);
            }
        };
        getMovieData();
    }, [id]);

    useEffect(() => {
        const fetchShowtimes = async () => {
            if (selectedCinema?.id && id) {
                try {
                    const res = await movieApi.getShowtimes({
                        movieId: id,
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
    }, [id, selectedCinema?.id, selectedDate]);

    const handleShowtimeClick = (st) => {
        setActiveShowtime(st);
        setIsModalOpen(true);
    };

    const groupedShowtimes = useMemo(() => {
        if (!showtimes || showtimes.length === 0) return {};

        const validShowtimes = showtimes.filter(st => isShowtimeValid(st.show_date, st.start_time));
        return validShowtimes.reduce((groups, st) => {
            let typeKey = st.room_type ? st.room_type.toUpperCase() : "2D";
            const versionName = st.format || "PHỤ ĐỀ";
            if (!groups[typeKey]) groups[typeKey] = {};
            if (!groups[typeKey][versionName]) {
                groups[typeKey][versionName] = [];
            }
            groups[typeKey][versionName].push(st);
            return groups;
        }, {});
    }, [showtimes]);

    if (!movie) return <div className={styles.loading}>Đang tải thông tin phim...</div>;

    const API_BASE_URL = "http://localhost:5000";
    // Lấy URL embed
    const trailerEmbedUrl = getEmbedUrl(movie.trailer_url || movie.trailer_code);



    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <div className={styles.container}>
                <nav className={styles.breadcrumb}>
                    <Link to="/">Trang chủ</Link> &gt; <span>{movie.title}</span>
                </nav>

                {/* 1. THÔNG TIN PHIM */}
                <div className={styles.mainContent}>
                    <div className={styles.posterSection}>
                        <img src={`${API_BASE_URL}${movie.poster}`} alt={movie.title} className={styles.mainPoster} />
                        {movie.rating && getAgeIcon(movie.rating) && (
                            <div className={styles.ageIconBadge}>
                                <img src={getAgeIcon(movie.rating)} alt="Rating" />
                            </div>
                        )}
                    </div>

                    <div className={styles.infoSection}>
                        <h1 className={styles.movieTitle}>{movie.title}</h1>
                        <p className={styles.description}>{movie.description}</p>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}><strong>Đạo diễn:</strong> <span>{movie.director}</span></div>
                            <div className={styles.detailItem}><strong>Diễn viên:</strong> <span>{movie.actors}</span></div>
                            <div className={styles.detailItem}><strong>Thể loại:</strong> <span>{movie.genre}</span></div>
                            <div className={styles.detailItem}><strong>Thời lượng:</strong> <span>{movie.duration} phút</span></div>
                            <div className={styles.detailItem}><strong>Ngôn ngữ:</strong> <span>{movie.language || 'Đang cập nhật'}</span></div>
                            <div className={styles.detailItem}>
                                <strong>Khởi chiếu:</strong>
                                <span>{movie.release_date ? dayjs(movie.release_date).format('DD/MM/YYYY') : 'Đang cập nhật'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. PHẦN SUẤT CHIẾU */}
                <div className={styles.showtimeSection}>
                    <div className={styles.showtimeHeader}>
                        <h3 className={styles.sectionTitle}>LỊCH CHIẾU</h3>
                        <span className={styles.currentCinema}>Rạp: <strong>{selectedCinema?.name || "Chưa chọn rạp"}</strong></span>
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
                                <div key={typeName} className={styles.typeWrapper} style={{ marginBottom: '25px' }}>
                                    <h2 className={styles.typeTitle} style={{
                                        fontSize: '1.6rem',
                                        color: '#0056b3',
                                        borderLeft: '5px solid #0056b3',
                                        paddingLeft: '10px',
                                        marginBottom: '15px'
                                    }}>
                                        {typeName}
                                    </h2>

                                    {Object.entries(versions).map(([versionName, list]) => (
                                        <div key={versionName} className={styles.formatGroup} style={{ marginBottom: '15px', marginLeft: '15px' }}>
                                            <div className={styles.formatLabel} style={{ fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                                                {versionName.toUpperCase()}
                                            </div>

                                            <div className={styles.timeGrid}>
                                                {list.map(st => (
                                                    // Thêm thẻ div bọc ngoài cùng để giữ nút và chữ ghế trống đi cùng nhau
                                                    <div key={st.id} className={styles.timeCardWrapper}>
                                                        <div
                                                            className={styles.timeCard}
                                                            onClick={() => handleShowtimeClick(st)}
                                                        >
                                                            <div className={styles.timeValue}>
                                                                {st.start_time ? st.start_time.substring(0, 5) : 'N/A'}
                                                            </div>
                                                            <div className={styles.seatCount}>{st.room_name}</div>
                                                        </div>

                                                        {/* Phần này bây giờ nằm ngoài timeCard */}
                                                        <div className={styles.emptySeatsOutside}>
                                                            {st.available_seats ?? 0} ghế trống
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <div className={styles.noShowtimes}>Rạp chưa có suất chiếu vào ngày này.</div>
                        )}
                    </div>
                </div>

                {/* --- 3. PHẦN TRAILER (MỚI THÊM VÀO ĐÂY) --- */}
                {trailerEmbedUrl && (
                    <div className={styles.trailerSection}>
                        <h3 className={styles.sectionTitle}>TRAILER</h3>
                        <div className={styles.videoWrapper}>
                            <iframe
                                src={trailerEmbedUrl}
                                title={`${movie.title} Trailer`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                )}

                {/* 4. MODAL XÁC NHẬN (Logic giữ nguyên) */}
                {isModalOpen && activeShowtime && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContainer}>
                            <button className={styles.modalClose} onClick={() => setIsModalOpen(false)}>&times;</button>
                            <h2 className={styles.modalHeading}>BẠN ĐANG ĐẶT VÉ XEM PHIM</h2>
                            <h1 className={styles.modalMovieTitle}>{movie.title}</h1>
                            <div className={styles.modalTable}>
                                <div className={styles.modalRow}>
                                    <div className={styles.modalCol}><strong>Rạp chiếu</strong></div>
                                    <div className={styles.modalCol}><strong>Ngày chiếu</strong></div>
                                    <div className={styles.modalCol}><strong>Giờ chiếu</strong></div>
                                </div>
                                <div className={styles.modalRow}>
                                    <div className={styles.modalCol}>{activeShowtime.cinema_name}</div>
                                    <div className={styles.modalCol}>{dayjs(activeShowtime.show_date).format('DD/MM/YYYY')}</div>
                                    <div className={styles.modalCol}>{activeShowtime.start_time.substring(0, 5)}</div>
                                </div>
                            </div>
                            <p className={styles.modalNote}>Kiểm tra lại thông tin trước khi tiếp tục.</p>
                            <div className={styles.modalFooter}>
                                <button className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>THOÁT</button>
                                <button
                                    className={styles.btnConfirm}
                                    onClick={() => {
                                        const token = localStorage.getItem('token');
                                        if (!token) {
                                            // Nếu chưa đăng nhập: Lưu lại URL trang chọn ghế để sau khi Login thì nhảy thẳng tới đó
                                            const redirectUrl = `/booking/${activeShowtime.id}`;
                                            navigate('/login', { state: { from: redirectUrl } });
                                        } else {
                                            // Nếu đã đăng nhập: Đi tiếp bình thường
                                            navigate(`/booking/${activeShowtime.id}`);
                                        }
                                    }}
                                >
                                    ĐỒNG Ý
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default MovieDetail;