import React from 'react';
import styles from '../ShowtimeStatistics.module.css';

const ShowtimeCards = ({ data }) => {
    // 1. Hàm format tiền tệ để hiển thị Doanh thu cho đẹp (ví dụ: 1.500.000)
    const formatNumber = (num) => {
        return new Intl.NumberFormat('vi-VN').format(Math.round(num || 0));
    };

    const kpis = [
        {
            title: 'Tổng suất chiếu',
            value: data?.totalShowtimes || 0,
            unit: 'suất',
            icon: '🎬'
        },
        // MỚI: Thêm Tổng số phòng
        {
            title: 'Phòng có suất chiếu',
            value: data?.totalRooms || 0,
            unit: 'phòng',
            icon: '🏢'
        },
        {
            title: 'Vé TB / suất',
            value: Math.round(data?.avgTicketsPerShow || 0),
            unit: 'vé',
            icon: '🎟️'
        },
        {
            title: 'Doanh thu TB / suất',
            value: formatNumber(data?.avgRevenuePerShow),
            unit: 'đ',
            icon: '💰'
        },
        {
            title: 'Lấp đầy trung bình',
            value: Math.round(data?.avgOccupancyRate || 0),
            unit: '%',
            icon: '🪑',
            highlight: true
        },
        {
            title: 'Suất kém hiệu quả',
            value: data?.lowEfficiencyShows || 0,
            unit: 'suất',
            icon: '⚠️',
            warning: true
        },
    ];

    return (
        <div className={styles.cardGrid}>
            {kpis.map((item, index) => (
                <div
                    key={index}
                    className={`
                        ${styles.card} 
                        ${item.highlight ? styles.cardPurple : ''} 
                        ${item.warning ? styles.cardRed : ''}
                    `}
                >
                    <div className={styles.cardIcon}>{item.icon}</div>
                    <div className={styles.cardContent}>
                        <span className={styles.cardTitle}>{item.title}</span>
                        <div className={styles.cardValue}>
                            {item.value} <small className={styles.unit}>{item.unit}</small>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ShowtimeCards;