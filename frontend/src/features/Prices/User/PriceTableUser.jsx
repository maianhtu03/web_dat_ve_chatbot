import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './PriceTableUser.module.css';

// --- IMPORT NAVBAR VÀ FOOTER ---
import Navbar from '../../../components/Layout/Navbar/Navbar';
import Footer from '../../../components/Layout/Footer/Footer';

const PriceTableUser = () => {
    const { theaterId } = useParams();
    const [priceData, setPriceData] = useState({ base_prices: [], surcharges: [] });
    const [theaterName, setTheaterName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Lấy tên rạp
                const theaterRes = await axios.get(`http://localhost:5000/api/cinemas/${theaterId}`);
                setTheaterName(theaterRes.data.name);

                // 2. Lấy cấu hình giá
                const response = await axios.get(`http://localhost:5000/api/prices/cinema/${theaterId}`);

                if (response.data.success) {
                    setPriceData(response.data.data);
                }
            } catch (error) {
                console.error("Lỗi fetch dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };

        if (theaterId) fetchData();
    }, [theaterId]);

    // Nhóm giá sàn theo loại ngày
    const weekdayPrices = priceData.base_prices.filter(p => p.day_type === 'T2-T6');
    const weekendPrices = priceData.base_prices.filter(p => p.day_type === 'T7-CN');

    // Phần hiển thị loading cũng cần có Nav/Footer để không bị giật trang
    if (loading) return (
        <>
            <Navbar />
            <div className={styles.loading}>Đang tải bảng giá...</div>
            <Footer />
        </>
    );

    return (
        <div className={styles.pageWrapper}>
            <Navbar />

            <main className={styles.mainContent}>
                <div className={styles.container}>
                    <h1 className={styles.title}>BẢNG GIÁ VÉ HỆ THỐNG RẠP</h1>
                    <h2 className={styles.theaterName}>Rạp: {theaterName || "Đang cập nhật"}</h2>

                    {/* PHẦN 1: BẢNG GIÁ SÀN */}
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>1. Giá vé cơ bản</h3>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Khung giờ</th>
                                    <th>Thứ 2 - Thứ 6</th>
                                    <th>Thứ 7 - Chủ Nhật</th>
                                </tr>
                            </thead>
                            <tbody>
                                {['Sang', 'Toi', 'Dem'].map(slot => (
                                    <tr key={slot}>
                                        <td className={styles.slotName}>
                                            {slot === 'Sang' ? 'Trước 18:00' : slot === 'Toi' ? '18:00 - 22:00' : 'Sau 22:00'}
                                        </td>
                                        <td>
                                            {weekdayPrices.find(p => p.time_slot === slot)?.price?.toLocaleString()} VNĐ
                                        </td>
                                        <td>
                                            {weekendPrices.find(p => p.time_slot === slot)?.price?.toLocaleString()} VNĐ
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {/* PHẦN 2: PHỤ THU */}
                    {priceData.surcharges.length > 0 && (
                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>2. Phụ thu (Nếu có)</h3>
                            <div className={styles.surchargeGrid}>
                                {priceData.surcharges.map(sc => (
                                    <div key={sc.id} className={styles.surchargeItem}>
                                        <span className={styles.scName}>{sc.name} ({sc.type === 'seat' ? 'Ghế' : 'Định dạng'}):</span>
                                        <span className={styles.scPrice}>+{sc.extra_fee?.toLocaleString()} VNĐ</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <div className={styles.note}>
                        * Giá vé trên chưa bao gồm phụ thu ngày Lễ/Tết nếu có.
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PriceTableUser;