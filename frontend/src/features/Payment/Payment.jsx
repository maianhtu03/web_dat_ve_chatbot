import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar/Navbar';
import MemberInfo from "./components/MemberInfo";
import ComboList from "./components/ComboList";
import styles from './Payment.module.css';
import momoIcon from '../../assets/images/momo.png';
import vnpayIcon from '../../assets/images/vnpay.png';
import zalopayIcon from '../../assets/images/zalopay.png';
import shoppeeIcon from '../../assets/images/shoppe_pay.png';
import qrIcon from '../../assets/images/qr_icon.png';
import memberApi from '../../api/memberApi';
import voucherApi from '../../api/voucherApi';
import { bookingApi } from '../../api/bookingApi';
import { paymentApi } from '../../api/paymentApi';
import { FaTicketAlt, FaCreditCard } from 'react-icons/fa';
import Footer from '../../components/Layout/Footer/Footer';
const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedSeats, showtime, totalPrice, expiryTimestamp } = location.state || {};

    const [selectedCombos, setSelectedCombos] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('vnpay');
    const [showPointInput, setShowPointInput] = useState(false); // Hiện/ẩn khung điểm
    const [showVoucherInput, setShowVoucherInput] = useState(false); // Hiện/ẩn khung voucher
    const [pointsToUse, setPointsToUse] = useState(0); // Số điểm user nhập
    const [userPoints, setUserPoints] = useState(0);
    const [pointDiscount, setPointDiscount] = useState(0);
    const [voucherCode, setVoucherCode] = useState(''); // Lưu mã user nhập
    const [voucherDiscount, setVoucherDiscount] = useState(0); // Số tiền được giảm
    const [appliedVoucher, setAppliedVoucher] = useState(null); // Lưu thông tin voucher đã áp dụng thành công
    const discountAmount = 0; // Logic giảm giá sẽ xử lý sau

    // Chuyển logic tính toán vào trong một function
    const calculateInitialTime = () => {
        if (!expiryTimestamp) return 0;
        const now = Date.now();
        const difference = Math.floor((expiryTimestamp - now) / 1000);
        return difference > 0 ? difference : 0;
    };

    // QUAN TRỌNG: Truyền tên hàm (không có dấu ngoặc) vào useState
    // Điều này giúp React chỉ chạy hàm này DUY NHẤT một lần khi component mount
    const [timeLeft, setTimeLeft] = useState(calculateInitialTime);
    useEffect(() => {
        const fetchPoints = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const userId = storedUser?.id || storedUser?.userId;

                if (userId) {
                    // Gọi đúng hàm lấy info thành viên như bên MemberCard
                    const data = await memberApi.getMemberInfo(userId);
                    // Theo file MemberCard bạn gửi, điểm nằm ở trường 'current_points'
                    setUserPoints(Number(data.current_points) || 0);
                }
            } catch (error) {
                console.error("Lỗi lấy điểm:", error);
            }
        };
        fetchPoints();
    }, []);

    React.useEffect(() => {
        // Giữ nguyên setInterval cũ của bạn vì nó chạy trong Effect nên không bị lỗi impure
        const timer = setInterval(() => {
            const now = Date.now();
            const difference = Math.floor((expiryTimestamp - now) / 1000);
            const remaining = difference > 0 ? difference : 0;

            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(timer);
                alert("Suất chiếu hoặc phiên giao dịch đã hết hạn!");
                navigate('/');
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [expiryTimestamp, navigate]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const comboPrice = useMemo(() => {
        return selectedCombos.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [selectedCombos]);

    const finalTotal = useMemo(() => {
        return (totalPrice || 0) + comboPrice - discountAmount - pointDiscount - voucherDiscount;
    }, [totalPrice, comboPrice, discountAmount, pointDiscount, voucherDiscount]);

    if (!location.state) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorBox}>
                    <p>Thông tin thanh toán không hợp lệ hoặc phiên làm việc đã hết hạn.</p>
                    <button onClick={() => navigate('/')}>Quay về trang chủ</button>
                </div>
            </div>
        );
    }
    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) return;

        const user = JSON.parse(localStorage.getItem('user'));

        // PHẢI KHỚP VỚI BE: userId, voucherCode, orderValue
        const payload = {
            userId: user?.id || null, // Nếu chưa đăng nhập thì gửi null
            voucherCode: voucherCode, // Ở FE bạn đang lưu state là voucherCode
            orderValue: (totalPrice || 0) + comboPrice // Tổng tiền đơn hàng
        };

        try {
            const response = await voucherApi.applyVoucher(payload);

            if (response.data) {
                // Lưu ý: Backend của bạn trả về data nằm trong data (res.status(200).json({ data: result }))
                const result = response.data.data;

                setVoucherDiscount(result.discountAmount);
                setAppliedVoucher({
                    id: result.voucherId, // Đây là ID lấy từ BE trả về
                    code: voucherCode
                });
                alert("Áp dụng thành công!");
            }
        } catch (error) {
            console.error("Lỗi áp dụng:", error.response?.data);
            alert(error.response?.data?.message || "Lỗi hệ thống");
        }
    };
    const handleRedeemPoints = () => {
        const points = Number(pointsToUse);

        // 1. Kiểm tra nếu nhập số âm hoặc không phải số
        if (points <= 0) {
            alert("Vui lòng nhập số điểm hợp lệ.");
            return;
        }

        // 2. Kiểm tra nếu nhập quá số điểm đang có
        if (points > userPoints) {
            alert("Bạn không đủ điểm để thực hiện giao dịch này.");
            return;
        }

        // 3. Logic: 1 điểm = 1.000 VNĐ (tùy bạn chỉnh tỉ lệ này)
        const discount = points;

        // 4. Kiểm tra nếu số tiền giảm vượt quá tổng hóa đơn
        const currentTotal = (totalPrice || 0) + comboPrice;
        if (discount > currentTotal) {
            alert("Số tiền giảm không được vượt quá tổng giá trị hóa đơn.");
            return;
        }

        setPointDiscount(discount);
        alert(`Đã áp dụng giảm giá ${discount.toLocaleString('vi-VN')}đ thành công!`);
    };

    const handlePayment = async () => {
        try {

            // 1. Kiểm tra phương thức thanh toán hợp lệ (Thêm momo vào danh sách cho phép)
            const validMethods = ['vnpay', 'atm', 'momo'];
            if (!validMethods.includes(paymentMethod)) {
                alert("Phương thức thanh toán này đang được bảo trì. Vui lòng chọn VNPAY hoặc MoMo.");
                return;
            }

            // Lấy thông tin user
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                alert("Vui lòng đăng nhập để tiếp tục.");
                return;
            }

            // 2. Tạo Booking trong Database (Giữ nguyên logic cũ rất tốt của bạn)
            const bookingData = {
                userId: user.id || user.userId,
                showtimeId: showtime.id,
                totalPrice: finalTotal,
                pointsUsed: pointDiscount,
                seatIds: selectedSeats.map(s => s.id),
                paymentMethod: paymentMethod.toUpperCase(),
                voucherId: appliedVoucher ? appliedVoucher.id : null,
                combos: selectedCombos.map(c => ({
                    id: c.id,
                    quantity: c.quantity
                }))
            };

            const bookingRes = await bookingApi.createBooking(bookingData);

            if (bookingRes.data.success) {
                const bookingId = bookingRes.data.bookingId;

                // 3. NHÁNH XỬ LÝ THANH TOÁN
                // Payment.jsx
                if (paymentMethod === 'momo') {
                    const paymentRes = await paymentApi.createMomoUrl({
                        amount: finalTotal,
                        bookingId: bookingId,
                        userId: user.id || user.userId, // PHẢI THÊM DÒNG NÀY
                    });

                    // Sửa dòng này để nhận diện đúng link từ BE
                    const link = paymentRes.data.payUrl || paymentRes.data.paymentUrl;

                    if (link) {
                        window.location.assign(link);
                    } else {
                        console.log("Dữ liệu BE trả về thực tế:", paymentRes.data); // Log ra để debug nếu vẫn lỗi
                        throw new Error("Không lấy được link thanh toán MoMo");
                    }


                } else {
                    // GỌI API VNPAY (GIỮ NGUYÊN LOGIC CŨ)
                    const paymentRes = await paymentApi.createVnpayUrl({
                        amount: finalTotal,
                        bookingId: bookingId
                    });

                    if (paymentRes.data.paymentUrl) {
                        window.location.assign(paymentRes.data.paymentUrl);
                    }
                }
            }
        } catch (error) {
            console.error("Lỗi thanh toán:", error);
            alert(error.response?.data?.message || "Có lỗi xảy ra trong quá trình tạo thanh toán.");
        }
    };
    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.leftColumn}>
                    {/* 1. THÔNG TIN THÀNH VIÊN */}
                    <MemberInfo />

                    {/* 2. DANH SÁCH COMBO (Đã đưa lên trên Giảm giá) */}
                    <ComboList onComboChange={setSelectedCombos} />

                    {/* 3. GIẢM GIÁ (Đã đưa xuống dưới Combo) */}
                    {/* 3. GIẢM GIÁ */}
                    <div className={styles.sectionBox}>
                        <h3 className={styles.sectionTitle}>
                            <FaTicketAlt className={styles.iconTitle} /> GIẢM GIÁ
                        </h3>

                        {/* --- PHẦN VOUCHER --- */}
                        <div className={styles.discountRow} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                <span>Beta Voucher</span>
                                <span
                                    className={styles.blueLink}
                                    onClick={() => setShowVoucherInput(!showVoucherInput)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    (Nhấn vào đây để xem danh sách voucher của bạn)
                                </span>
                            </div>

                            {showVoucherInput && (
                                <div className={styles.expandBox}>
                                    <div className={styles.inputGroupInline}>
                                        <div className={styles.inputField} style={{ flex: 1 }}>
                                            <label>Mã Voucher</label>
                                            <input
                                                type="text"
                                                placeholder="Nhập mã ưu đãi..."
                                                value={voucherCode}
                                                onChange={(e) => setVoucherCode(e.target.value)}
                                            />
                                        </div>
                                        {/* Bỏ ô Mã PIN, chỉ để nút ĐĂNG KÝ/ÁP DỤNG */}
                                        <button
                                            className={styles.btnRegister}
                                            onClick={handleApplyVoucher}
                                        >
                                            ÁP DỤNG
                                        </button>
                                    </div>

                                    {/* Hiển thị thông báo nếu đã áp dụng */}
                                    {appliedVoucher && (
                                        <p style={{ color: 'green', fontSize: '0.85rem', marginTop: '5px' }}>
                                            ✓ Đã áp dụng mã: <strong>{appliedVoucher.code}</strong>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* --- PHẦN ĐIỂM BETA --- */}
                        <div className={styles.discountRow} style={{ flexDirection: 'column', alignItems: 'flex-start', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
                                <span>Điểm Beta</span>
                                <span
                                    className={styles.blueLink}
                                    onClick={() => setShowPointInput(!showPointInput)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    (Nhấn vào đây để xem điểm tích lũy của bạn)
                                </span>
                            </div>

                            {showPointInput && (
                                <div className={styles.expandBox}>
                                    <div className={styles.pointInputContainer}>
                                        <div className={styles.pointDetail}>
                                            <label>Điểm hiện có</label>
                                            <span className={styles.pointVal}>{userPoints.toLocaleString('vi-VN')}</span>
                                        </div>
                                        <div className={styles.pointDetail}>
                                            <label>Nhập điểm</label>
                                            <input
                                                type="number"
                                                className={styles.miniInput}
                                                value={pointsToUse}
                                                onChange={(e) => setPointsToUse(e.target.value)}
                                                max={userPoints}
                                            />
                                        </div>
                                        <div className={styles.pointDetail}>
                                            <label>Số tiền được giảm</label>
                                            {/* Hiển thị dựa trên giá trị đang nhập ở input */}
                                            <span className={styles.discountVal}>= {(Number(pointsToUse) || 0).toLocaleString('vi-VN')}đ</span>
                                        </div>

                                        {/* Gắn sự kiện onClick vào đây */}
                                        <button className={styles.btnRedeem} onClick={handleRedeemPoints}>ĐỔI ĐIỂM</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. BẢNG TÍNH TỔNG TIỀN CHI TIẾT */}
                    <div className={styles.finalPricingTable}>
                        <div className={styles.priceLine}>
                            <span>Tổng tiền:</span>
                            <span className={styles.strikePrice}>{(totalPrice + comboPrice).toLocaleString('vi-VN')} vnđ</span>
                        </div>
                        <div className={styles.priceLine}>
                            <span>Số tiền được giảm:</span>
                            <span>{(pointDiscount + voucherDiscount).toLocaleString('vi-VN')} vnđ</span>
                        </div>
                        <div className={styles.priceLine}>
                            <span>Số tiền cần thanh toán:</span>
                            <span className={styles.grandTotalText}>{finalTotal.toLocaleString('vi-VN')} vnđ</span>
                        </div>
                    </div>

                    {/* 5. PHƯƠNG THỨC THANH TOÁN */}
                    {/* 5. PHƯƠNG THỨC THANH TOÁN */}
                    <div className={styles.sectionBox}>
                        <h3 className={styles.sectionTitle}>
                            <FaCreditCard className={styles.iconTitle} /> PHƯƠNG THỨC THANH TOÁN
                        </h3>
                        <p className={styles.paymentSub}>Chọn thẻ thanh toán</p>
                        <div className={styles.paymentGrid}>
                            {[
                                { id: 'momo', label: 'Ví MoMo', icon: momoIcon },
                                { id: 'vnpay', label: 'Mã QR (VNPAY)', icon: vnpayIcon },
                                { id: 'zalopay', label: 'Ví ZaloPay', icon: zalopayIcon },
                                { id: 'shopeepay', label: 'Ví ShopeePay', icon: shoppeeIcon },
                                { id: 'atm', label: 'Thẻ nội địa / QR', icon: qrIcon }
                            ].map((method) => (
                                <label key={method.id} className={`${styles.paymentItem} ${paymentMethod === method.id ? styles.activeMethod : ''}`}>
                                    <div className={styles.radioWrapper}>
                                        <input
                                            type="radio"
                                            name="payMethod"
                                            value={method.id}
                                            checked={paymentMethod === method.id}
                                            onChange={() => setPaymentMethod(method.id)}
                                        />
                                        <span className={styles.customRadio}></span>
                                    </div>
                                    <div className={styles.methodContent}>
                                        <img src={method.icon} alt={method.label} className={styles.methodIcon} />
                                        <span className={styles.methodLabel}>{method.label}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className={styles.timerWrapper}>
                        <span>Thời gian thanh toán còn lại: </span>
                        <span className={styles.countdownText}>{formatTime(timeLeft)}</span>
                    </div>
                </div>

                {/* SIDEBAR BÊN PHẢI (HÓA ĐƠN) */}
                <div className={styles.rightColumn}>
                    <div className={styles.stickySidebar}>
                        <div className={styles.movieTicket}>
                            <img
                                src={`http://localhost:5000${showtime.poster}`}
                                alt="Poster"
                                className={styles.poster}
                                onError={(e) => e.target.src = 'https://via.placeholder.com/150x220?text=No+Poster'}
                            />
                            <div className={styles.movieDetails}>
                                <h3 className={styles.movieTitle}>{showtime.movie_title}</h3>
                                <p className={styles.formatText}>
                                    <strong>{showtime.movie_format || '2D Phụ đề'}</strong>
                                </p>
                                <div className={styles.movieSubInfoPayment}>
                                    <p style={{ fontSize: '0.9rem', margin: '5px 0' }}>
                                        <span style={{ marginRight: '8px' }}>🏷️</span>
                                        <strong>Thể loại: </strong>{showtime.movie_genres || "Chưa cập nhật"}
                                    </p>
                                    <p style={{ fontSize: '0.9rem', margin: '5px 0' }}>
                                        <span style={{ marginRight: '8px' }}>🕒</span>
                                        <strong>Thời lượng: </strong>{showtime.movie_duration || 120} phút
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.infoList}>
                            {/* Rạp chiếu */}
                            <div className={styles.infoItem}>
                                <div className={styles.infoLeft}>
                                    <span className={styles.sidebarIcon}>🏛️</span>
                                    <span className={styles.infoLabel}>Rạp chiếu</span>
                                </div>
                                <span className={styles.infoVal}>{showtime.cinema_name}</span>
                            </div>

                            {/* Ngày chiếu - Tách ra từ suất chiếu cho giống Booking */}
                            <div className={styles.infoItem}>
                                <div className={styles.infoLeft}>
                                    <span className={styles.sidebarIcon}>📅</span>
                                    <span className={styles.infoLabel}>Ngày chiếu</span>
                                </div>
                                <span className={styles.infoVal}>
                                    {new Date(showtime.show_date).toLocaleDateString('vi-VN')}
                                </span>
                            </div>

                            {/* Giờ chiếu */}
                            <div className={styles.infoItem}>
                                <div className={styles.infoLeft}>
                                    <span className={styles.sidebarIcon}>🕒</span>
                                    <span className={styles.infoLabel}>Giờ chiếu</span>
                                </div>
                                <span className={styles.infoVal}>
                                    {showtime.start_time.substring(0, 5)}
                                </span>
                            </div>

                            {/* Phòng chiếu */}
                            <div className={styles.infoItem}>
                                <div className={styles.infoLeft}>
                                    <span className={styles.sidebarIcon}>🚪</span>
                                    <span className={styles.infoLabel}>Phòng chiếu</span>
                                </div>
                                <span className={styles.infoVal}>{showtime.room_name || "Phòng 01"}</span>
                            </div>

                            {/* Ghế ngồi */}
                            <div className={styles.infoItem}>
                                <div className={styles.infoLeft}>
                                    <span className={styles.sidebarIcon}>💺</span>
                                    <span className={styles.infoLabel}>Ghế ngồi</span>
                                </div>
                                <span className={styles.infoValBlue}>
                                    {selectedSeats.map(s => s.displayLabel).sort().join(', ')}
                                </span>
                            </div>
                        </div>

                        <div className={styles.summary}>
                            <div className={styles.summaryRow}><span>Tổng tiền vé</span><span>{totalPrice.toLocaleString('vi-VN')} đ</span></div>
                            {comboPrice > 0 && (
                                <div className={styles.summaryRow}><span>Combo bắp nước</span><span>{comboPrice.toLocaleString('vi-VN')} đ</span></div>
                            )}
                            <div className={styles.totalRow}>
                                <span>Tổng cộng</span>
                                <span className={styles.grandTotal}>{finalTotal.toLocaleString('vi-VN')} đ</span>
                            </div>
                        </div>

                        <div className={styles.actionButtons}>
                            <button className={styles.btnBack} onClick={() => navigate(-1)}>QUAY LẠI</button>
                            <button className={styles.btnNext} onClick={handlePayment}>TIẾP TỤC</button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Payment;