import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from './PaymentResult.module.css'; // Bạn tạo file CSS riêng nhé

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const ticketCode = searchParams.get('ticketCode');
    const bookingId = searchParams.get('id'); // Lấy ID từ URL Backend gửi về

    return (
        <div className={styles.container}>
            <div className={styles.successBox}>
                <div className={styles.icon}>✅</div>
                <h1>Thanh toán thành công!</h1>
                <p>Cảm ơn bạn đã tin tưởng MTU Cinemas.</p>
                <div className={styles.info}>
                    <p>Mã hóa đơn của bạn: <strong style={{ color: '#ff5722', fontSize: '18px' }}>{ticketCode || bookingId}</strong></p>
                    <p>Vé đã được gửi vào email và lịch sử đặt vé của bạn.</p>
                </div>
                <div className={styles.actions}>
                    <button onClick={() => navigate('/')} className={styles.btnHome}>
                        Quay về trang chủ
                    </button>
                    <button onClick={() => navigate('/thanh-vien?tab=history')} className={styles.btnHistory}>
                        Xem lịch sử đặt vé
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;