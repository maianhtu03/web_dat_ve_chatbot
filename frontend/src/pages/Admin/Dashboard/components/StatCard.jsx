import React from 'react';
import styles from '../AdminDashboard.module.css';

const StatCard = ({ title, value, icon, trend = 0, color }) => {
    // Logic để xác định hướng của trend (tăng/giảm/ngang)
    const isPositive = trend > 0;
    const isNegative = trend < 0;

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div>
                    <p className={styles.cardTitle}>{title}</p>
                    {/* Hiển thị giá trị, nếu không có thì để 0 */}
                    <h3 className={styles.cardValue}>{value || 0}</h3>
                </div>
                {/* iconBox với màu nền nhạt 20% từ màu chủ đạo */}
                <div className={styles.iconBox} style={{ backgroundColor: `${color}20`, color: color }}>
                    {icon}
                </div>
            </div>
            <div className={styles.cardFooter}>
                <span className={isPositive ? styles.trendUp : isNegative ? styles.trendDown : styles.trendNeutral}>
                    {isPositive ? '▲' : isNegative ? '▼' : '●'} {Math.abs(trend)}%
                </span>
                {/* Sửa "So với hôm qua" thành "So với kỳ trước" để đúng với mọi bộ lọc */}
                <span className={styles.trendText}> So với kỳ trước</span>
            </div>
        </div>
    );
};

export default StatCard;