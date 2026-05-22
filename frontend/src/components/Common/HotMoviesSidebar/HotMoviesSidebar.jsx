import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import movieApi from '../../../api/movieApi'; // Đảm bảo đường dẫn này đúng
import styles from './HotMoviesSidebar.module.css';

const HotMoviesSidebar = () => {
    const [hotMovies, setHotMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const BASE_URL = "http://localhost:5000";

    useEffect(() => {
        const fetchHotMovies = async () => {
            setLoading(true);
            try {
                const res = await movieApi.getHotMovies();
                if (res && res.data) {
                    setHotMovies(res.data);
                }
            } catch (error) {
                console.error("Lỗi lấy danh sách phim hot:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHotMovies();
    }, []);

    if (loading) return <div className={styles.loading}>Đang tải...</div>;
    if (hotMovies.length === 0) return null;

    return (
        <div className={styles.sidebarContainer}>
            <h3 className={styles.title}>PHIM ĐANG HOT</h3>

            {/* Thêm class gridList ở đây */}
            <div className={styles.gridList}>
                {hotMovies.map((movie) => {
                    // Check cả 2 trường hợp tên cột poster/image_url
                    const posterPath = movie.image_url || movie.poster;

                    return (
                        <div
                            key={movie.id}
                            className={styles.gridItem}
                            onClick={() => navigate(`/movie/${movie.id}`)}
                        >
                            <div className={styles.imageWrapper}>
                                {/* Thêm nhãn T16 nếu dữ liệu có rating */}
                                {movie.rating && (
                                    <span className={styles.ratingLabel}>{movie.rating}</span>
                                )}
                                <img
                                    src={`${BASE_URL}${posterPath}`}
                                    alt={movie.title}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://placehold.co/150x220?text=No+Poster';
                                    }}
                                />
                            </div>

                            {/* Chỉ giữ lại tiêu đề phim, bỏ genre và button */}
                            <div className={styles.info}>
                                <h4 className={styles.movieTitle}>{movie.title}</h4>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HotMoviesSidebar;