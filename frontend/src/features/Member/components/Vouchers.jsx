import React, { useEffect, useState } from 'react';
import voucherApi from '../../../api/voucherApi'; // Đảm bảo đường dẫn này đúng với project của bạn
import styles from './Vouchers.module.css'; // Tạo file CSS tương ứng

const Vouchers = () => {
    const [myVouchers, setMyVouchers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Giả sử bạn lưu thông tin user trong localStorage sau khi login
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    useEffect(() => {
        const fetchMyVouchers = async () => {
            try {
                if (userId) {
                    const res = await voucherApi.getMyVouchers(userId);
                    setMyVouchers(res.data || []);
                }
            } catch (error) {
                console.error("Lỗi lấy danh sách voucher:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyVouchers();
    }, [userId]);

    if (loading) return <div>Đang tải dữ liệu...</div>;

    return (
        <div className={styles.container}>
            {/* PHẦN 1: VOUCHER CỦA TÔI */}
            <div className={styles.section}>
                <h3 className={styles.title}>VOUCHER CỦA TÔI</h3>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>MÃ VOUCHER</th>
                            <th>NỘI DUNG VOUCHER</th>
                            <th>LOẠI VOUCHER</th>
                            <th>NGÀY HẾT HẠN</th>
                            <th>THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myVouchers.length > 0 ? (
                            myVouchers.map((v) => (
                                <tr key={v.id}>
                                    <td className={styles.code}>{v.voucher_code}</td>
                                    <td>{v.description || v.title}</td>
                                    <td>{v.discount_type === 'percent' ? `Giảm ${v.discount_value}%` : `Giảm ${v.discount_value.toLocaleString()}đ`}</td>
                                    <td>{new Date(v.expiry_date).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <button className={styles.btnUse}>Dùng ngay</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className={styles.empty}>Không có voucher</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PHẦN 2: LỊCH SỬ VOUCHER */}
            <div className={styles.section} style={{ marginTop: '30px' }}>
                <h3 className={styles.title}>LỊCH SỬ VOUCHER</h3>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>THỜI GIAN</th>
                            <th>MÃ VOUCHER</th>
                            <th>NỘI DUNG VOUCHER</th>
                            <th>TRẠNG THÁI</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="4" className={styles.empty}>Không có dữ liệu</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Vouchers;