import React, { useState, useEffect } from 'react';
import styles from './Points.module.css';
import memberApi from '../../../api/memberApi';

const Points = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        earned: 0,
        used: 0,
        current: 0,
        expiring: 0
    });

    useEffect(() => {
        const fetchPointsData = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const userId = storedUser?.id || storedUser?.userId;

                if (!userId) {
                    setLoading(false);
                    return;
                }

                const [memberInfo, pointHistory] = await Promise.all([
                    memberApi.getMemberInfo(userId),
                    memberApi.getPointHistory(userId)
                ]);

                if (memberInfo) {
                    setSummary({
                        earned: memberInfo.total_points_accumulated || 0,
                        used: memberInfo.used_points || 0,
                        current: memberInfo.current_points || 0,
                        expiring: memberInfo.expiring_points || 0
                    });
                }

                setHistory(pointHistory || []);

            } catch (error) {
                console.error("Lỗi fetch điểm:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPointsData();
    }, []);

    const formatDateTime = (item) => {
        const dateVal = item.time || item.created_at || item.payment_date;
        if (!dateVal) return "Vừa xong";

        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return "Mới đây";

        return d.toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
        }).replace(',', '');
    };

    if (loading) return <div className={styles.loading}>Đang tải dữ liệu điểm...</div>;

    return (
        <div className={styles.container}>
            <section className={styles.overview}>
                <h2 className={styles.title}>TỔNG QUAN</h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoRow}>
                        <span>Điểm đã tích luỹ</span>
                        <span className={styles.value}>{summary.earned.toLocaleString()} điểm</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Điểm đã sử dụng</span>
                        <span className={styles.value}>{summary.used.toLocaleString()} điểm</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Điểm hiện có</span>
                        <span className={`${styles.value} ${styles.currentValue}`}>
                            {summary.current.toLocaleString()} điểm
                        </span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Điểm sắp hết hạn</span>
                        <span className={styles.value}>{summary.expiring.toLocaleString()} điểm</span>
                    </div>
                </div>
            </section>

            <section className={styles.history}>
                <h2 className={styles.title}>LỊCH SỬ ĐIỂM</h2>
                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>THỜI GIAN</th>
                                <th>SỐ ĐIỂM</th>
                                <th>NỘI DUNG</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? (
                                history.map((item, index) => {
                                    // 1. Tính toán số điểm (3% của totalPrice nếu points null)
                                    const calcPoints = item.points !== null ? Number(item.points) : (Number(item.totalPrice) * 0.03);

                                    // 2. Logic Hiển thị: Mặc định là tích điểm (dấu cộng) 
                                    // Trừ khi item.type explicitly là 'minus' (sử dụng điểm để thanh toán)
                                    const isMinus = item.type === 'minus' && !item.totalPrice;
                                    // Lưu ý: Nếu có totalPrice thì thường là đi mua vé -> Tích điểm (+)
                                    const isPlus = !isMinus;

                                    return (
                                        <tr key={index}>
                                            <td className={styles.centerText}>{formatDateTime(item)}</td>
                                            <td className={isPlus ? styles.plusPoints : styles.minusPoints}>
                                                {isPlus ? '+' : '-'} {Math.abs(Math.floor(calcPoints)).toLocaleString()}
                                            </td>
                                            <td>{item.content || "Tích điểm từ hóa đơn"}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="3" className={styles.empty}>Chưa có lịch sử tích điểm.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Points;