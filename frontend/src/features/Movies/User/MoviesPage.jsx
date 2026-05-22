import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MovieCard from '../../../components/Common/MovieCard/MovieCard';
import movieApi from '../../../api/movieApi';
import { socket } from '../../../utils/socket';
import TrailerModal from '../../../components/Common/TrailerModal/TrailerModal';

// --- IMPORT NAVBAR VÀ FOOTER ---
import Navbar from '../../../components/Layout/Navbar/Navbar'; // Bạn kiểm tra lại đường dẫn import này cho đúng với dự án
import Footer from '../../../components/Layout/Footer/Footer'; // Bạn kiểm tra lại đường dẫn import này cho đúng với dự án
import GenreFilter from '../../../components/Common/GenreFilter/GenreFilter';
import styles from './HomeMovieList.module.css';

const MoviesPage = () => {
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
            console.log("⚡ Realtime Update (Page):", data.action);
            fetchMovies();
        };

        socket.on('movie_list_changed', handleSocketUpdate);
        return () => {
            socket.off('movie_list_changed', handleSocketUpdate);
        };
    }, [fetchMovies]);

    const filteredMovies = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];

        let result = movies.filter(m => {
            const startDate = m.release_date;
            const endDate = m.end_date;

            if (activeTab === 'upcoming') {
                if (startDate) return startDate > today;
                return m.status === 'Upcoming';
            }

            if (activeTab === 'showing') {
                const isPublished = m.status === 'Published';
                const isInDateRange = startDate <= today && (!endDate || endDate >= today);
                return startDate ? (isPublished && isInDateRange) : isPublished;
            }

            if (activeTab === 'special') {
                return m.early_show_count > 0 && startDate > today;
            }

            return true;
        });
        if (selectedGenre !== "Tất cả") {
            result = result.filter(m =>
                m.genre && m.genre.includes(selectedGenre)
            );
        }

        return result;
    }, [movies, activeTab, selectedGenre]);

    if (loading) return <div className={styles.loading}>Đang tải phim...</div>;

    return (
        <div className={styles.pageWrapper}>
            {/* 1. HIỂN THỊ NAVBAR */}
            <Navbar />

            {/* 2. NỘI DUNG CHÍNH (Thêm min-height để đẩy Footer xuống đáy) */}
            <main className={styles.container} style={{ marginBottom: '50px', minHeight: '60vh' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    Danh Sách Phim
                </h2>

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
                    movies={movies}
                    selectedGenre={selectedGenre}
                    onGenreChange={setSelectedGenre}
                />
                <div className={styles.movieGrid}>
                    {filteredMovies.length > 0 ? (
                        filteredMovies.map(movie => (
                            <div key={movie.id} className={styles.cardContainer}>
                                <MovieCard
                                    movie={movie}
                                    onPlayClick={() => openTrailer(movie.trailer_code)}
                                />
                                {(activeTab === 'upcoming' || activeTab === 'special') && movie.release_date && (
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
            </main>

            <TrailerModal
                trailerUrl={trailerUrl}
                onClose={() => setTrailerUrl(null)}
            />

            {/* 3. HIỂN THỊ FOOTER */}
            <Footer />
        </div>
    );
};

export default MoviesPage;