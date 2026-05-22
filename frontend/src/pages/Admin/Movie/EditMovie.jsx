import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieApi } from '../../../api/movieApi';
import MovieForm from '../../../features/Movies/Admin/MovieForm';

const EditMovie = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movieData, setMovieData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMovieDetail = async () => {
        try {
            const res = await movieApi.getById(id);
            setMovieData(res.data);
        } catch (err) {
            console.error("Lỗi tải chi tiết phim:", err);
            alert("Không thể tải thông tin phim!");
            navigate('/admin/movies');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovieDetail();
    }, [id]);

    return (
        <div style={{ padding: '20px' }}>
            <h1>SỬA THÔNG TIN PHIM</h1>
            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <MovieForm
                    initialData={movieData}
                    onSubmitSuccess={() => navigate('/admin/movies')}
                />
            )}
        </div>
    );
};

export default EditMovie;