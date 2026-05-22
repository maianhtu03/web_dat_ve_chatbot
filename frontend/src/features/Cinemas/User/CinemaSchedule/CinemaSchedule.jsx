import React, { useState, useEffect } from 'react';
import showtimeApi from '../../../../api/showtimeApi';
import DateTabs from './DateTabs';
import MovieItem from './MovieItem';
import BookingModal from './BookingModal'; // Import file Modal mới tạo
import styles from './CinemaSchedule.module.css';

const CinemaSchedule = ({ cinemaId }) => {
    const [groupedMovies, setGroupedMovies] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('sv-SE'));
    const [loading, setLoading] = useState(false);

    // --- LOGIC MODAL MỚI ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedShowtime, setSelectedShowtime] = useState(null);
    const [selectedMovie, setSelectedMovie] = useState(null);

    const handleOpenModal = (showtime, movie) => {
        setSelectedShowtime(showtime);
        setSelectedMovie(movie);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!cinemaId) return;
            setLoading(true);
            try {
                const data = await showtimeApi.getCinemaSchedule(cinemaId, selectedDate);
                setGroupedMovies(data);
            } catch (err) {
                console.error(err);
                setGroupedMovies([]);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, [cinemaId, selectedDate]);

    return (
        <div className={styles.mainScheduleContainer}>
            <DateTabs selectedDate={selectedDate} onDateChange={setSelectedDate} />
            <div className={styles.scheduleBody}>
                {loading ? (
                    <div className={styles.centeredMessage}>Đang tải...</div>
                ) : groupedMovies.length > 0 ? (
                    groupedMovies.map(movie => (
                        <MovieItem
                            key={movie.movie_id}
                            movie={movie}
                            onShowtimeClick={handleOpenModal} // Truyền hàm xuống con
                        />
                    ))
                ) : (
                    <div className={styles.noShowtimesContainer}>
                        <p className={styles.noShowtimesText}>Tiếc quá, hôm nay rạp chưa có lịch chiếu.</p>
                    </div>
                )}
            </div>

            {/* Hiển thị Modal khi có sự kiện click */}
            {isModalOpen && (
                <BookingModal
                    movie={selectedMovie}
                    showtime={selectedShowtime}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default CinemaSchedule;