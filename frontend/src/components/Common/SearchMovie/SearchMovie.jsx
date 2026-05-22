import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, X } from 'lucide-react';
import movieApi from '../../../api/movieApi'; // Đảm bảo đường dẫn này đúng
import styles from './SearchMovie.module.css';

const SearchMovie = () => {
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef(null);

    const BASE_URL = 'http://localhost:5000'; // URL Backend của bạn

    // 1. Xử lý click ra ngoài để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 2. Logic tìm kiếm với Debounce
    useEffect(() => {
        if (!keyword.trim()) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const delay = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await movieApi.searchMovies(keyword);
                if (res.data.success) {
                    setResults(res.data.data);
                    setIsOpen(true);
                }
            } catch (err) {
                console.error("Lỗi tìm kiếm phim:", err);
            } finally {
                setIsLoading(false);
            }
        }, 400); // Tăng lên 400ms để giảm tải server hơn chút

        return () => clearTimeout(delay);
    }, [keyword]);

    const handleSelectMovie = (movieId) => {
        navigate(`/movie/${movieId}`);
        setIsOpen(false);
        setKeyword('');
    };

    const handleClearSearch = () => {
        setKeyword('');
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div className={styles.searchWrapper} ref={searchRef}>
            <div className={styles.searchBox}>
                <Search className={styles.searchIcon} size={18} />
                <input
                    type="text"
                    placeholder="Tìm tên phim..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onFocus={() => keyword.length > 0 && setIsOpen(true)}
                />
                {isLoading ? (
                    <Loader2 className={styles.loadingIcon} size={18} />
                ) : (
                    keyword && <X className={styles.clearIcon} size={18} onClick={handleClearSearch} />
                )}
            </div>

            {/* Dropdown kết quả */}
            {isOpen && (
                <div className={styles.dropdown}>
                    {results.length > 0 ? (
                        results.map((movie) => (
                            <div
                                key={movie.id}
                                className={styles.item}
                                onClick={() => handleSelectMovie(movie.id)}
                            >
                                <img
                                    src={movie.poster ? `${BASE_URL}${movie.poster}` : 'https://via.placeholder.com/45x65?text=No+Image'}
                                    alt={movie.title}
                                />
                                <div className={styles.info}>
                                    <span className={styles.title}>{movie.title}</span>
                                    <span className={styles.meta}>{movie.genre} • {movie.duration} phút</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noResult}>
                            Không tìm thấy phim "{keyword}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchMovie;