import React from 'react';
import styles from './CinemaSchedule.module.css';

const DateTabs = ({ selectedDate, onDateChange }) => {
    const generateDates = () => {
        const dates = [];
        const today = new Date();
        const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

        for (let i = 0; i < 7; i++) {
            const nextDay = new Date(); // Tạo đối tượng mới
            nextDay.setDate(today.getDate() + i);

            // SỬA TẠI ĐÂY: Dùng sv-SE để lấy định dạng YYYY-MM-DD theo giờ VN
            const dateStr = nextDay.toLocaleDateString('sv-SE');

            dates.push({
                fullDate: dateStr,
                displayDate: `${nextDay.getDate()}/${nextDay.getMonth() + 1}`,
                dayOfWeek: i === 0 ? 'Hôm nay' : daysOfWeek[nextDay.getDay()]
            });
        }
        return dates;
    };
    return (
        <div className={styles.dateTabsContainer}>
            {generateDates().map((date) => (
                <div
                    key={date.fullDate}
                    className={`${styles.dateTabItem} ${selectedDate === date.fullDate ? styles.activeTab : ''}`}
                    onClick={() => onDateChange(date.fullDate)}
                >
                    <div className={styles.tabDay}>{date.dayOfWeek}</div>
                    <div className={styles.tabDate}>{date.displayDate}</div>
                    {selectedDate === date.fullDate && <div className={styles.activeUnderline}></div>}
                </div>
            ))}
        </div>
    );
};

export default DateTabs;