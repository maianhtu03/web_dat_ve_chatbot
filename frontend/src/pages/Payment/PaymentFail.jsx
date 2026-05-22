import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from './PaymentResult.module.css';

const PaymentFail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const ticketCode = searchParams.get('ticketCode');
    const bookingId = searchParams.get('id');

    return (
        <div className={styles.container}>
            <div className={styles.failBox}>
                <div className={styles.icon}>❌</div>
                <h1>Thanh toán thất bại</h1>
                <p>Giao dịch của bạn đã bị hủy hoặc gặp lỗi từ phía ngân hàng.</p>

                {(ticketCode || bookingId) && (
                    <div className={styles.info} style={{ marginBottom: '20px', background: '#fff5f5', padding: '10px', borderRadius: '5px' }}>
                        <p style={{ margin: 0, color: '#e53e3e' }}>Mã đơn hàng lỗi: <strong>{ticketCode || bookingId}</strong></p>
                    </div>
                )}
                <div className={styles.actions}>
                    {/* Đã loại bỏ nút Thử lại */}
                    <button onClick={() => navigate('/')} className={styles.btnHome}>
                        Quay về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFail;