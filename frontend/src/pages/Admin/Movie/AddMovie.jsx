import React from 'react';
import { useNavigate } from 'react-router-dom';
import MovieForm from '../../../features/Movies/Admin/MovieForm';

const AddMovie = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '20px' }}>
            <h1>THÊM PHIM MỚI</h1>
            <MovieForm onSubmitSuccess={() => navigate('/admin/movies')} />
        </div>
    );
};

export default AddMovie;