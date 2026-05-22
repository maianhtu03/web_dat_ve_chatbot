import React from 'react';
import styles from '../MovieStatistics.module.css';

const MovieTable = ({ data }) => {
    if (!data || data.length === 0) return <p>Không có dữ liệu chi tiết phim</p>;

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.movieTable}>
                <thead>
                    <tr>
                        <th>Tên phim</th>
                        <th>Thể loại</th>
                        <th>Trạng thái</th>
                        <th>Phim Hot</th>
                        <th>Tổng vé</th>
                        <th>Doanh thu</th>
                        <th>% Lấp đầy</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((movie, index) => (
                        <tr key={index}>
                            <td className={styles.movieTitle}>{movie.title}</td>
                            <td>{movie.genre}</td>
                            <td>
                                <span className={movie.status === 'Published' ? styles.statusActive : styles.statusPending}>
                                    {movie.status === 'Published' ? 'Đang chiếu' : 'Ẩn'}
                                </span>
                            </td>
                            <td>
                                {movie.is_hot === 1 ? (
                                    <span className={styles.hotBadge}>🔥 Hot</span>
                                ) : (
                                    <span className={styles.normalBadge}>Thường</span>
                                )}
                            </td>
                            <td>{movie.totalTickets}</td>
                            <td>{new Intl.NumberFormat('vi-VN').format(movie.revenue)}đ</td>
                            <td>
                                <div className={styles.progressContainer}>
                                    <div
                                        className={styles.progressBar}
                                        style={{
                                            width: `${movie.occupancyRate}%`,
                                            backgroundColor: movie.occupancyRate > 70 ? '#10b981' : movie.occupancyRate > 40 ? '#f59e0b' : '#ef4444'
                                        }}
                                    ></div>
                                    <span className={styles.progressText}>{movie.occupancyRate}%</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MovieTable;