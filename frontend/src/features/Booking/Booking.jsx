import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import moment from 'moment';

import showtimeApi from '../../api/showtimeApi';
import priceApi from '../../api/priceApi';
import styles from './Booking.module.css';
import Navbar from '../../components/Layout/Navbar/Navbar';
import { bookingService } from './bookingService';
// Import Icons
import normalIcon from '../../assets/images/seat-unselect-normal.png';
import vipIcon from '../../assets/images/seat-unselect-vip.png';
import coupleIcon from '../../assets/images/seat-unselect-double.png';
import selectedNormalIcon from '../../assets/images/seat-select-normal.png';
import selectedVipIcon from '../../assets/images/seat-select-vip.png';
import selectedCoupleIcon from '../../assets/images/seat-select-double.png';
import bookedNormalIcon from '../../assets/images/seat-buy-normal.png';
import bookedVipIcon from '../../assets/images/seat-buy-vip.png';
import bookedCoupleIcon from '../../assets/images/seat-buy-double.png';
import holdingIcon from '../../assets/images/seat-process-normal.png';
import holdingVipIcon from '../../assets/images/seat-process-vip.png';
import holdingCoupleIcon from '../../assets/images/seat-process-double.png';
import seatSetNormalIcon from '../../assets/images/seat-set-normal.png';
import seatSetVipIcon from '../../assets/images/seat-set-vip.png';
import seatSetDoubleIcon from '../../assets/images/seat-set-double.png';
import screenIcon from '../../assets/images/ic-screen.png';

const socket = io('http://localhost:5000', { withCredentials: true });

// const getSlotName = (startTime) => {
//     const hour = parseInt(startTime.split(':')[0]);
//     if (hour >= 18 && hour < 22) return 'Toi';
//     if (hour >= 22 || hour < 6) return 'Dem';
//     return 'Sang';
// };

const Booking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showtime, setShowtime] = useState(null);
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [lockedSeats, setLockedSeats] = useState({});
    const [timeLeft, setTimeLeft] = useState(600);
    const [priceConfig, setPriceConfig] = useState(null);

    useEffect(() => {
        const fetchBookingData = async () => {
            try {
                const res = await showtimeApi.getBookingData(id);
                const serverSeats = res.seats || []; // Ghế thực tế từ Database

                setShowtime(res.showtime);
                setSeats(serverSeats);

                const saved = bookingService.storage.get(id);
                if (saved) {
                    const now = Date.now();
                    const remaining = Math.floor((saved.expiryTimestamp - now) / 1000);

                    if (remaining > 0) {
                        setTimeLeft(remaining);
                    // --- BƯỚC SỬA QUAN TRỌNG: Lọc ghế ---
                    // Chỉ giữ lại những ghế từ storage mà Database báo là chưa bị ai mua (is_booked !== 1)
                    const validSeats = saved.selectedSeats.filter(savedSeat => {
                        const seatInServer = serverSeats.find(s => s.id === savedSeat.id);
                        // Điều kiện: Ghế phải tồn tại trên server và chưa được đặt (status không phải booked)
                        return seatInServer && seatInServer.is_booked !== 1 && seatInServer.status !== 'booked';
                    });

                    if (validSeats.length > 0) {
                        setSelectedSeats(validSeats);
                        setTimeLeft(saved.timeLeft);

                        // Chỉ lock lại những ghế thực sự còn trống
                        validSeats.forEach(s => {
                            socket.emit('lock_seat', { showtimeId: id, seatId: s.id });
                        });

                        // Cập nhật ngược lại storage để loại bỏ các ghế đã bị mua (nếu có)
                        bookingService.storage.save(id, {
                            selectedSeats: validSeats,
                            timeLeft: saved.timeLeft
                        });
                    } else {
                        // Nếu toàn bộ ghế trong storage đều đã bị mua/hết hạn -> Xóa trắng storage
                        bookingService.storage.clear(id);
                        setSelectedSeats([]);
                    }
                }
            }

                if (res.showtime?.cinema_id) {
                    const priceRes = await priceApi.getByCinemaId(res.showtime.cinema_id);
                    const finalData = priceRes.data?.data || priceRes.data;
                    setPriceConfig(finalData);
                }
            } catch (err) {
                console.error("Lỗi lấy dữ liệu đặt vé:", err);
            }
        };
        fetchBookingData();
        socket.emit('join_booking', id);

        socket.on('sync_locked_seats', (data) => setLockedSeats(data));
        socket.on('seat_locked', ({ seatId }) => setLockedSeats(prev => ({ ...prev, [seatId]: true })));
        socket.on('seat_unlocked', ({ seatId }) => {
            setLockedSeats(prev => {
                const newState = { ...prev };
                delete newState[seatId];
                return newState;
            });
        });
        socket.on('start_countdown', ({ expireAt }) => {
            const secondsRemaining = Math.floor((expireAt - Date.now()) / 1000);
            setTimeLeft(secondsRemaining > 0 ? secondsRemaining : 0);
        });

        return () => {
            socket.emit('leave_booking', id);
            socket.disconnect();
        };
    }, [id]);


    // Tìm đến đoạn useEffect ở dòng 94 và sửa lại như sau:
    useEffect(() => {
        // 1. Xử lý khi hết giờ
        if (timeLeft <= 0) {
            if (selectedSeats.length > 0) {
                selectedSeats.forEach(s => socket.emit('unlock_seat', { showtimeId: id, seatId: s.id }));
            }
            bookingService.storage.clear(id);
            setTimeout(() => {
                alert("Hết thời gian giữ ghế. Vui lòng chọn lại!");
                navigate('/');
            }, 100);
            return;
        }

        // 2. Logic đếm ngược: BỎ ĐIỀU KIỆN if (selectedSeats.length > 0)
        // Để nó luôn chạy ngay khi component mount
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);

        // Thêm selectedSeats vào dependencies để khi chọn ghế nó không bị reset timer sai cách
    }, [timeLeft, id, navigate, selectedSeats]);

    // CHỈNH SỬA CHÍNH: Logic gộp ghế và đánh dấu ghế đôi lẻ
    // Copy đoạn này vào trang Booking của bạn
    const groupedSeats = useMemo(() => {
        const rows = {};
        // 1. Nhóm theo hàng
        seats.forEach(seat => {
            if (!rows[seat.row_label]) rows[seat.row_label] = [];
            rows[seat.row_label].push(seat);
        });

        const finalGroups = {};
        Object.entries(rows).forEach(([label, rowSeats]) => {
            const newRow = [];
            // Quan trọng: Sử dụng biến đếm độc lập cho mỗi hàng
            let activeCounter = 1;

            for (let i = 0; i < rowSeats.length; i++) {
                const current = rowSeats[i];
                const next = rowSeats[i + 1];

                // Kiểm tra nếu là ghế đôi (Couple) và có ghế tiếp theo để gộp
                if (current.type === 'couple' && next && next.type === 'couple' && i % 2 === 0) {
                    const isCoupleActive = current.status !== 'hidden';
                    newRow.push({
                        ...current,
                        isBetaCouple: true,
                        isExtraOdd: false,
                        // Đánh số dựa trên activeCounter
                        displayLabel: `${label}${activeCounter}-${label}${activeCounter + 1}`
                    });

                    // Nếu ghế không bị ẩn thì mới tăng biến đếm
                    if (isCoupleActive) activeCounter += 2;
                    i++; // Nhảy qua ghế tiếp theo đã gộp
                } else {
                    const isSeatActive = current.status !== 'hidden';
                    const isOddCouple = current.type === 'couple';

                    newRow.push({
                        ...current,
                        isBetaCouple: false,
                        isExtraOdd: isOddCouple,
                        displayLabel: `${label}${activeCounter}`
                    });

                    // Chỉ tăng biến đếm nếu ghế hiển thị và không phải ghế lẻ của couple
                    if (isSeatActive && !isOddCouple) activeCounter += 1;
                }
            }
            finalGroups[label] = newRow;
        });
        return finalGroups;
    }, [seats]);



    const totalPrice = useMemo(() => {
        return bookingService.calculateTotal(selectedSeats, priceConfig, showtime);
    }, [selectedSeats, priceConfig, showtime]);

    // 3. Biến CHI TIẾT LOẠI GHẾ (Thêm mới để hiển thị ở Footer)
    const seatTypeSummary = useMemo(() => {
        return bookingService.getGroupedSeats(selectedSeats, priceConfig, showtime);
    }, [selectedSeats, priceConfig, showtime]);
    const handleSeatClick = (seat) => {
        if (lockedSeats[seat.id] && !selectedSeats.find(s => s.id === seat.id)) {
            return;
        }
        // 1. Giữ nguyên các điều kiện chặn click của bạn
        if (seat.is_booked || seat.is_broken === 1 || lockedSeats[seat.id] || seat.isReserved || seat.status === 'hidden' || seat.isExtraOdd) return;

        const isSelected = selectedSeats.find(s => s.id === seat.id);

        if (isSelected) {
            // --- LOGIC HỦY CHỌN (Giữ nguyên) ---
            const newSelected = selectedSeats.filter(s => s.id !== seat.id);
            setSelectedSeats(newSelected);
            socket.emit('unlock_seat', { showtimeId: id, seatId: seat.id });

            // Cập nhật lại bộ nhớ tạm ngay khi hủy chọn để đồng bộ
            bookingService.storage.save(id, { selectedSeats: newSelected, timeLeft });
        } else {
            // --- LOGIC CHỌN MỚI ---

            // Kiểm tra tối đa 8 ghế (Giữ nguyên)
            if (selectedSeats.length >= 8) return alert("Bạn chỉ được chọn tối đa 8 ghế");

            // KIỂM TRA SO LE (Mới thêm - Gọi từ service)
            // Lấy toàn bộ ghế trong hàng của ghế vừa click
            const rowSeats = seats.filter(s => s.row_label === seat.row_label);
            if (!bookingService.checkGapSeat(seat, rowSeats, selectedSeats)) {
                alert("Bạn không thể để trống một ghế đơn lẻ ở giữa hàng.");
                return;
            }

            // Nếu hợp lệ thì tiến hành chọn
            const newSelected = [...selectedSeats, seat];
            setSelectedSeats(newSelected);
            socket.emit('lock_seat', { showtimeId: id, seatId: seat.id });

            // Cập nhật bộ nhớ tạm (10p) ngay lập tức
            bookingService.storage.save(id, { selectedSeats: newSelected, timeLeft });
        }
    };
    const handleContinue = () => {
        // Lưu vào storage trước khi chuyển trang
        const expiryTimestamp = Date.now() + (timeLeft * 1000);
        bookingService.storage.save(id, {
            selectedSeats,
            expiryTimestamp,
            timeLeft
        });

        navigate('/payment', { state: { selectedSeats, showtime, totalPrice, expiryTimestamp } });
    };
    // Đổi tên thành seatTypeSummary để tránh trùng với groupedSeats ở dòng 107


    if (!showtime) return <div className={styles.loading}>Đang tải dữ liệu phòng vé...</div>;

    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.breadcrumb}>
                    Trang chủ &gt; Đặt vé &gt; <span className={styles.activeMovie}>{showtime.movie_title}</span>
                </div>

                <div className={styles.ageBanner}>
                    Lưu ý: Phim phân loại T{showtime.movie_rating}. Khán giả dưới {showtime.movie_rating} tuổi sẽ không được vào rạp.
                </div>

                <div className={styles.mainContent}>
                    <section className={styles.seatSection}>
                        <div className={styles.topLegend}>
                            <div className={styles.legItem}><img src={normalIcon} alt="" /> Ghế trống</div>
                            <div className={styles.legItem}><img src={selectedNormalIcon} alt="" /> Đang chọn</div>
                            <div className={styles.legItem}><img src={holdingIcon} alt="" /> Đang giữ</div>
                            <div className={styles.legItem}><img src={bookedNormalIcon} alt="" /> Đã bán</div>
                            <div className={styles.legItem}><img src={seatSetNormalIcon} alt="" /> Ghế hỏng</div>
                        </div>

                        <div className={styles.screenWrapper}>
                            <img src={screenIcon} alt="Screen" className={styles.screenIcon} />
                        </div>

                        <div className={styles.gridContainer}>
                            {Object.entries(groupedSeats).map(([label, rowSeats]) => (
                                <div key={label} className={styles.row}>
                                    {rowSeats.map((seat) => {
                                        // Ẩn ghế nếu là ghế đôi lẻ hoặc status hidden
                                        if (seat.isExtraOdd || seat.status === 'hidden') {
                                            return <div key={seat.id} className={styles.seatHidden} />;
                                        }

                                        const isSelected = selectedSeats.find(s => s.id === seat.id);
                                        const isLocked = lockedSeats[seat.id];
                                        const isReserved = seat.isReserved === true || seat.status === 'reserved';
                                        const isBooked = seat.status === 'booked' || seat.is_booked === 1;
                                        const isBroken = seat.is_broken === 1;
                                        const seatType = seat.type?.toLowerCase();

                                        // TRONG PHẦN RENDER (Dòng ~210)
                                         let iconSrc;

                                        if (isBooked) {

                                            iconSrc = seatType === 'vip' ? bookedVipIcon : seatType === 'couple' ? bookedCoupleIcon : bookedNormalIcon;
                                        } else if (isLocked || isReserved) {
                                            // ĐƯA CÁI NÀY LÊN TRƯỚC: Nếu server báo đang giữ ghế, ưu tiên hiện màu xanh nhạt
                                            iconSrc = seatType === 'vip' ? holdingVipIcon : seatType === 'couple' ? holdingCoupleIcon : holdingIcon;
                                        } else if (isSelected) {
                                            // Chỉ hiện màu xanh đậm nếu ghế ĐANG TRỐNG và được user click vào
                                            iconSrc = seatType === 'vip' ? selectedVipIcon : seatType === 'couple' ? selectedCoupleIcon : selectedNormalIcon;
                                        } else if (isBroken) {
                                            iconSrc = seatType === 'vip' ? seatSetVipIcon : seatType === 'couple' ? seatSetDoubleIcon : seatSetNormalIcon;
                                        } else {
                                            iconSrc = seatType === 'vip' ? vipIcon : seatType === 'couple' ? coupleIcon : normalIcon;
                                        }


                                        return (
                                            <div
                                                key={seat.id}
                                                className={`
                                                    ${styles.seatWrapper} 
                                                    ${seat.isBetaCouple ? styles.coupleWidth : ''} 
                                                    ${isBroken ? styles.brokenSeat : ''}
                                                `}
                                                onClick={() => handleSeatClick(seat)}
                                            >
                                                <img src={iconSrc} className={styles.seatIcon} alt="seat" />
                                                <span className={`${styles.seatNumber} ${(isBooked || isSelected) ? styles.whiteText : ''}`}>
                                                    {seat.displayLabel}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                        <div className={styles.bottomLegend}>
                            {/* Nếu chưa chọn ghế nào, hiển thị chú thích cũ hoặc dòng thông báo */}
                            {selectedSeats.length === 0 ? (
                                <>
                                    <div className={styles.legItem}><img src={normalIcon} alt="" /> Ghế thường</div>
                                    <div className={styles.legItem}><img src={vipIcon} alt="" /> Ghế VIP</div>
                                    <div className={styles.legItem}><img src={coupleIcon} alt="" /> Ghế đôi</div>
                                </>
                            ) : (
                                /* Nếu đã chọn ghế, hiển thị chi tiết số lượng và giá tiền từng loại */
                                <div className={styles.priceDetails}>
                                    {seatTypeSummary.map((group, index) => (
                                        <div key={index} className={styles.priceItem}>
                                            <div className={styles.typeInfo}>
                                                <img
                                                    src={group.icon === 'vip' ? vipIcon : group.icon === 'couple' ? coupleIcon : normalIcon}
                                                    alt=""
                                                    className={styles.miniIcon}
                                                />
                                                <span>{group.typeName}</span>
                                            </div>
                                            <div className={styles.countInfo}>
                                                {group.count} x {group.price.toLocaleString('vi-VN')} vnđ
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className={styles.sidebar}>
                        <div className={styles.movieCard}>
                            <div className={styles.posterWrapper}>
                                <img src={`http://localhost:5000${showtime.poster}`} className={styles.poster} alt="poster" />
                                <span className={styles.ratingBadge}>T{showtime.movie_rating}</span>
                            </div>
                            <div className={styles.movieDetails}>
                                <h2 className={styles.movieTitle}>{showtime.movie_title}</h2>
                                {/* Định dạng đưa lên ngay dưới tên phim theo mẫu */}
                                <p className={styles.formatBadge}>{showtime.movie_format || "2D Phụ đề"}</p>

                                <div className={styles.movieSubInfo}>
                                    <p>
                                        <span className={styles.iconLabel}>🏷️</span>
                                        <strong>Thể loại: </strong>{showtime.movie_genres || "Kinh dị, Giật gân"}
                                    </p>
                                    <p>
                                        <span className={styles.iconLabel}>🕒</span>
                                        <strong>Thời lượng: </strong>{showtime.movie_duration || 120} phút
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.infoList}>
                            <div className={styles.infoItem}>
                                <div className={styles.infoLeft}>
                                    <span className={styles.sidebarIcon}>🏛️</span>
                                    <span className={styles.infoLabel}>Rạp chiếu</span>
                                </div>
                                <span className={styles.infoVal}>{showtime.cinema_name || showtime.branch_name}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.infoLeft}>
                                    <span className={styles.sidebarIcon}>📅</span>
                                    <span className={styles.infoLabel}>Ngày chiếu</span>
                                </div>
                                <span className={styles.infoVal}>{moment(showtime.show_date).format('DD/MM/YYYY')}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.infoLeft}>
                                    <span className={styles.sidebarIcon}>🕒</span>
                                    <span className={styles.infoLabel}>Giờ chiếu</span>
                                </div>
                                <span className={styles.infoVal}>{showtime.start_time.substring(0, 5)}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.infoLeft}>
                                    <span className={styles.sidebarIcon}>🚪</span>
                                    <span className={styles.infoLabel}>Phòng chiếu</span>
                                </div>
                                <span className={styles.infoVal}>{showtime.room_name || "P101"}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.infoLeft}>
                                    <span className={styles.sidebarIcon}>💰</span>
                                    <span className={styles.infoLabel}>Ghế ngồi</span>
                                </div>
                                <span className={styles.infoValBlue}>
                                    {selectedSeats.map(s => s.displayLabel).sort().join(', ') || 'Chưa chọn'}
                                </span>
                            </div>
                        </div>

                        <div className={styles.checkoutBox}>
                            <div className={styles.totalGroup}>
                                <span className={styles.totalLabel}>Tổng tiền</span>
                                <span className={styles.totalPrice}>{totalPrice.toLocaleString('vi-VN')} đ</span>
                            </div>
                            <div className={styles.timeGroup}>
                                <span className={styles.totalLabel}>Thời gian giữ ghế</span>
                                <span className={styles.timerCount}>
                                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                                </span>
                            </div>
                            <button
                                disabled={selectedSeats.length === 0}
                                onClick={handleContinue} // Gọi hàm này thay vì navigate trực tiếp
                                className={styles.btnContinue}
                            >
                                TIẾP TỤC
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Booking;