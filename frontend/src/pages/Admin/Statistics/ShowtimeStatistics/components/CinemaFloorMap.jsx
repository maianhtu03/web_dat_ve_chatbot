import React from 'react';
import styles from '../ShowtimeStatistics.module.css';



const CinemaFloorMap = ({ roomSummary, onRoomClick }) => {
    return (
        <div className={styles.floorMapContainer}>
            {roomSummary.map((room) => (
                <div
                    key={room.room_id}
                    className={`${styles.roomBox} ${styles[room.showtimes[0]?.status || 'good']}`}
                    onClick={() => onRoomClick(room)}
                >
                    <div className={styles.roomName}>{room.room_name}</div>
                    <div className={styles.movieTitle}>
                        {room.showtimes[0]?.movie_title || 'Trống lịch'}
                    </div>
                    <div className={styles.occupancyBar}>
                        <div
                            className={styles.fill}
                            style={{ width: `${room.showtimes[0]?.occupancy_rate || 0}%` }}
                        ></div>
                    </div>
                    <div className={styles.statsText}>
                        Lấp đầy: {room.showtimes[0]?.occupancy_rate || 0}%
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CinemaFloorMap;