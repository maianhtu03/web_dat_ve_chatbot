import React from 'react';
import { DollarSign, Ticket, Award } from 'lucide-react';
import styles from '../FoodStatistics.module.css';

const FoodSummaryCards = ({ revenue, quantity, bestSeller, dateRange }) => {
    const formatMoney = (val) => new Intl.NumberFormat('vi-VN').format(val || 0) + ' đ';

    return (
        <>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardLabel}>TỔNG TIỀN BÁN RA</span>
                    <div className={`${styles.iconBox} ${styles.bgGreen}`}><DollarSign size={18} /></div>
                </div>
                <div className={styles.cardValue}>{formatMoney(revenue)}</div>
                <div className={styles.cardSub}>Từ {dateRange}</div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardLabel}>TỔNG SỐ LƯỢNG COMBO</span>
                    <div className={`${styles.iconBox} ${styles.bgBlue}`}><Ticket size={18} /></div>
                </div>
                <div className={styles.cardValue}>{quantity || 0}</div>
                <div className={styles.cardSub}>Từ {dateRange}</div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardLabel}>BÁN CHẠY NHẤT</span>
                    <div className={`${styles.iconBox} ${styles.bgYellow}`}><Award size={18} /></div>
                </div>
                <div className={styles.cardValue} style={{ fontSize: '1.2rem' }}>{bestSeller || 'N/A'}</div>
                <div className={styles.cardSub}>Sản phẩm mang lại doanh thu cao nhất</div>
            </div>
        </>
    );
};

export default FoodSummaryCards;