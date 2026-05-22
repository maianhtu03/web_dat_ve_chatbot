import React from 'react';
import styles from '../MovieStatistics.module.css';
import { Film, PlayCircle, Calendar, Flame, Trophy } from 'lucide-react';

const MovieCards = ({ data }) => {
    const cardItems = [
        {
            title: "Tổng số phim",
            value: data?.totalMovies || 0,
            icon: <Film size={22} />,
            colorClass: styles.blue,
            desc: "Phim trong hệ thống",
            isText: false
        },
        {
            title: "Đang chiếu",
            value: data?.currentlyShowing || 0,
            icon: <PlayCircle size={22} />,
            colorClass: styles.green,
            desc: "Tại các cụm rạp",
            isText: false
        },
        {
            title: "Sắp chiếu",
            value: data?.comingSoon || 0,
            icon: <Calendar size={22} />,
            colorClass: styles.orange,
            desc: "Phim sắp ra mắt",
            isText: false
        },
        {
            title: "Phim HOT 🔥",
            value: data?.topHotMovie || "N/A",
            icon: <Flame size={22} />,
            colorClass: styles.red,
            desc: "Doanh thu cao nhất",
            isText: true
        },
        {
            title: "Bán chạy nhất",
            value: data?.bestSellerMovie || "N/A",
            icon: <Trophy size={22} />,
            colorClass: styles.purple,
            desc: "Lượng vé kỷ lục",
            isText: true
        }
    ];

    return (
        <div className={styles.movieCardGrid}>
            {cardItems.map((item, index) => (
                <div key={index} className={styles.card}>
                    <div className={styles.cardInfo}>
                        <span className={styles.cardTitle}>{item.title}</span>
                        <div className={item.isText ? styles.cardTextValue : styles.cardValue}>
                            {item.value}
                        </div>
                        <span className={styles.cardDesc}>{item.desc}</span>
                    </div>

                    <div className={`${styles.iconBox} ${item.colorClass}`}>
                        {item.icon}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MovieCards;