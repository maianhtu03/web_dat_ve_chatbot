import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MovieCard from '../../../components/Common/MovieCard/MovieCard';
import movieApi from '../../../api/movieApi';
import { socket } from '../../../utils/socket';
import styles from './HomeMovieList.module.css';
import TrailerModal from '../../../components/Common/TrailerModal/TrailerModal';
import GenreFilter from '../../../components/Common/GenreFilter/GenreFilter';
const HomeMovieList = () => {
    const [activeTab, setActiveTab] = useState('showing');
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trailerUrl, setTrailerUrl] = useState(null);

    const [selectedGenre, setSelectedGenre] = useState("Tất cả");
    const openTrailer = (url) => {
        if (!url) {
            alert("Phim này hiện chưa có link trailer!");
            return;
        }
        setTrailerUrl(url);
    };

    const fetchMovies = useCallback(async () => {
        try {
            const response = await movieApi.getAllUser();
            setMovies(response.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách phim:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMovies();
        const handleSocketUpdate = (data) => {
            console.log("⚡ Realtime Update:", data.action);
            fetchMovies();
        };

        socket.on('movie_list_changed', handleSocketUpdate);
        return () => {
            socket.off('movie_list_changed', handleSocketUpdate);
        };
    }, [fetchMovies]);

    const filteredMovies = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];

        let tabFiltered = movies.filter(m => {
            const startDate = m.release_date;
            const endDate = m.end_date;

            // 1. TAB PHIM SẮP CHIẾU (GIỮ NGUYÊN LOGIC CŨ CỦA BẠN)
            if (activeTab === 'upcoming') {
                if (startDate) return startDate > today;
                return m.status === 'Upcoming';
            }

            // 2. TAB PHIM ĐANG CHIẾU (GIỮ NGUYÊN LOGIC CŨ CỦA BẠN)
            if (activeTab === 'showing') {
                const isPublished = m.status === 'Published';
                const isInDateRange = startDate <= today && (!endDate || endDate >= today);
                return startDate ? (isPublished && isInDateRange) : isPublished;
            }

            // 3. TAB SUẤT CHIẾU ĐẶC BIỆT (XỬ LÝ CHUẨN THEO Ý BẠN)
            if (activeTab === 'special') {
                // ĐIỀU KIỆN: Phải có ít nhất 1 suất chiếu sớm từ Backend (early_show_count > 0)
                // VÀ phim này chưa đến ngày khởi chiếu chính thức (startDate > today)
                return m.early_show_count > 0 && startDate > today;
            }

            return true;
        });

        if (selectedGenre !== "Tất cả") {
            tabFiltered = tabFiltered.filter(m =>
                m.genre && m.genre.includes(selectedGenre)
            );
        }

        return tabFiltered;
    }, [movies, activeTab, selectedGenre]);

    if (loading) return <div className={styles.loading}>Đang tải phim...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'upcoming' ? styles.active : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    PHIM SẮP CHIẾU
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'showing' ? styles.active : ''}`}
                    onClick={() => setActiveTab('showing')}
                >
                    PHIM ĐANG CHIẾU
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'special' ? styles.active : ''}`}
                    onClick={() => setActiveTab('special')}
                >
                    SUẤT CHIẾU ĐẶC BIỆT
                </button>
            </div>
            <GenreFilter
                movies={movies} // Truyền toàn bộ phim để nó tự lấy ra các thể loại hiện có
                selectedGenre={selectedGenre}
                onGenreChange={(genre) => setSelectedGenre(genre)}
            />
            <div className={styles.movieGrid}>
                {filteredMovies.length > 0 ? (
                    filteredMovies.map(movie => (
                        <div key={movie.id} className={styles.cardContainer}>
                            {/* ĐÃ LOẠI BỎ PHẦN SNEAK SHOW TẠI ĐÂY */}

                            <MovieCard
                                movie={movie}
                                onPlayClick={() => openTrailer(movie.trailer_code)}
                            />

                            {/* Hiển thị ngày khởi chiếu bên dưới nếu ở tab Sắp chiếu */}
                            {activeTab === 'upcoming' && movie.release_date && (
                                <p className={styles.releaseDate}>
                                    Khởi chiếu: {new Date(movie.release_date).toLocaleDateString('vi-VN')}
                                </p>
                            )}
                        </div>
                    ))
                ) : (
                    <div className={styles.noData}>Hiện chưa có phim nào trong mục này.</div>
                )}
            </div>

            <TrailerModal
                trailerUrl={trailerUrl}
                onClose={() => setTrailerUrl(null)}
            />
        </div>
    );
};

export default HomeMovieList;