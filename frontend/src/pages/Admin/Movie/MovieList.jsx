import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { movieApi } from '../../../api/movieApi';
import AdminMovieTable from '../../../features/Movies/Admin/AdminMovieTable';
import styles from './MovieList.module.css';

const MovieList = () => {
    const [movies, setMovies] = useState([]);
    const [filter, setFilter] = useState('all'); // all, Published, Draft
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchMovies = async () => {
        try {
            setLoading(true);
            const status = filter === 'all' ? '' : filter;
            const res = await movieApi.getAllAdmin(status);
            setMovies(res.data);
        } catch (err) {
            console.error("Lỗi tải phim:", err);
            alert("Không thể tải danh sách phim!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, [filter]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>QUẢN LÝ PHIM</h2>
                <button
                    className={styles.btnAdd}
                    onClick={() => navigate('/admin/movies/add')}
                >
                    + THÊM PHIM MỚI
                </button>
            </div>

            <div className={styles.tabs}>
                <button
                    onClick={() => setFilter('all')}
                    className={filter === 'all' ? styles.active : ''}
                >
                    Tất cả
                </button>
                <button
                    onClick={() => setFilter('Published')}
                    className={filter === 'Published' ? styles.active : ''}
                >
                    Đã xuất bản
                </button>
                <button
                    onClick={() => setFilter('Draft')}
                    className={filter === 'Draft' ? styles.active : ''}
                >
                    Bản nháp
                </button>
            </div>

            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <AdminMovieTable movies={movies} onRefresh={fetchMovies} />
            )}
        </div>
    );
};

export default MovieList;