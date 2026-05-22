import React, { useMemo } from 'react';
import styles from '../ShowtimeStatistics.module.css';

const ShowtimeHeatmap = ({ data }) => {
    // 1. Cố định khung giờ từ 8h đến 23h
    const hours = useMemo(() => Array.from({ length: 16 }, (_, i) => i + 8), []);

    // 2. Lấy danh sách phòng từ dữ liệu thực tế
    const rooms = useMemo(() => {
        if (!data || data.length === 0) return [];
        return [...new Set(data.map(d => d.roomName))].sort();
    }, [data]);

    // 3. Hàm tính màu sắc theo tông Đỏ (Heatmap chuẩn)
    const getColor = (val) => {
        if (val === 0) return '#f8fafc'; // Trắng xám khi không có khách
        if (val < 20) return '#fee2e2';
        if (val < 40) return '#fecaca';
        if (val < 60) return '#fca5a5';
        if (val < 80) return '#ef4444';
        return '#b91c1c'; // Đỏ đậm (Rất đông)
    };

    if (rooms.length === 0) {
        return (
            <div className={styles.noData}>
                <p>Không có dữ liệu suất chiếu trong khoảng thời gian này.</p>
            </div>
        );
    }

    return (
        <div className={styles.heatmapWrapper}>
            <div className={styles.heatmapContainer}>
                <table className={styles.heatmapTable}>
                    <thead>
                        <tr>
                            <th className={styles.stickyCol}>Phòng / Giờ</th>
                            {hours.map(h => <th key={h}>{h}h</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map(room => (
                            <tr key={room}>
                                <td className={`${styles.roomName} ${styles.stickyCol}`}>{room}</td>
                                {hours.map(h => {
                                    // Tìm dữ liệu khớp - Ép kiểu số để so sánh chính xác
                                    const info = data?.find(d =>
                                        parseInt(d.hour) === h && d.roomName === room
                                    );

                                    const val = info ? Math.round(info.occupancy) : 0;

                                    return (
                                        <td
                                            key={h}
                                            style={{
                                                backgroundColor: getColor(val),
                                                color: val > 60 ? '#fff' : '#1e293b',
                                                cursor: val > 0 ? 'pointer' : 'default'
                                            }}
                                            // Tooltip hiển thị chi tiết khi di chuột
                                            title={val > 0 ? `${room} - ${h}h: ${val}% lấp đầy` : 'Không có suất chiếu'}
                                        >
                                            <div className={styles.cellContent}>
                                                {val > 0 ? `${val}%` : ''}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Chú thích màu sắc (Legend) */}
            <div className={styles.legend}>
                <span className={styles.legendLabel}>Tỷ lệ lấp đầy:</span>
                <div className={styles.legendItems}>
                    <div className={styles.legendItem}><i style={{ background: '#f8fafc' }}></i> 0%</div>
                    <div className={styles.legendItem}><i style={{ background: '#fee2e2' }}></i> {'<20%'}</div>
                    <div className={styles.legendItem}><i style={{ background: '#fca5a5' }}></i> 40-60%</div>
                    <div className={styles.legendItem}><i style={{ background: '#ef4444' }}></i> 60-80%</div>
                    <div className={styles.legendItem}><i style={{ background: '#b91c1c' }}></i> {'>80%'}</div>
                </div>
            </div>
        </div>
    );
};

export default ShowtimeHeatmap;