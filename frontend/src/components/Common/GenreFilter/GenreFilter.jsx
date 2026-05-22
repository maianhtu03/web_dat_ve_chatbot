import React, { useMemo } from 'react';
import styles from './GenreFilter.module.css';

const GenreFilter = ({ movies, selectedGenre, onGenreChange }) => {
    // Tự động bóc tách các thể loại từ danh sách phim (Dynamic Genres)
    const dynamicGenres = useMemo(() => {
        const genreSet = new Set();
        movies.forEach(movie => {
            if (movie.genre) {
                // Tách chuỗi "Hành động, Hài" thành mảng và xóa khoảng trắng
                const genreArray = movie.genre.split(',').map(g => g.trim());
                genreArray.forEach(g => { if (g) genreSet.add(g); });
            }
        });
        return ["Tất cả", ...Array.from(genreSet).sort()];
    }, [movies]);

    return (
        <div className={styles.filterWrapper}>
            <div className={styles.genreList}>
                {dynamicGenres.map((genre) => (
                    <button
                        key={genre}
                        className={`${styles.genreBtn} ${selectedGenre?.trim() === genre.trim() ? styles.active : ''}`}
                        onClick={() => onGenreChange(genre)}
                    >
                        {genre}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GenreFilter;