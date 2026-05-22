import React from 'react';
import { useNavigate } from 'react-router-dom';
import { movieApi } from '../../../api/movieApi';
import MovieStatusSwitch from './MovieStatusSwitch';
import styles from './AdminMovieTable.module.css';

const AdminMovieTable = ({ movies, onRefresh }) => {
    const navigate = useNavigate();
    const BASE_URL = 'http://localhost:5000';
    const handleDelete = async (id, title) => {
        if (window.confirm(`Bạn có chắc muốn xóa phim: ${title}?`)) {
            try {
                await movieApi.delete(id);
                alert("Xóa phim thành công!");
                onRefresh(); // Load lại danh sách
            } catch (error) {
                console.error("Xóa phim thất bại:", error);
                alert("Lỗi xóa phim!");
            }
        }
    };
    const handleToggleHot = async (id, currentHot) => {
        try {
            const newHotStatus = Number(currentHot) === 1 ? 0 : 1;

            // Gọi hàm từ movieApi đã thêm lúc trước
            // Gửi object { is_hot: ... }
            await movieApi.updateHot(id, { is_hot: newHotStatus });

            onRefresh();
        } catch (error) {
            console.error("Chi tiết lỗi Hot:", error.response?.data || error);
            alert("Lỗi: " + (error.response?.data?.message || "Không thể cập nhật"));
        }
    };
    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Hình ảnh</th>
                    <th>Thông tin phim</th>
                    <th>Trạng thái</th>
                    <th>Hoạt động</th>
                    <th>Hot</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody>
                {movies.map((movie, index) => (
                    <tr key={movie.id}>
                        <td>{index + 1}</td>
                        <td>
                            <img
                                // Nối BASE_URL với đường dẫn trong database
                                src={movie.poster ? `${BASE_URL}${movie.poster}` : 'https://via.placeholder.com/100x150?text=No+Image'}
                                alt={movie.title}
                                className={styles.poster}
                                onError={(e) => {
                                    // Nếu link ảnh hỏng, hiển thị ảnh mặc định thay vì icon vỡ
                                    e.target.src = 'https://via.placeholder.com/100x150?text=Error';
                                }}
                            />
                        </td>
                        <td>
                            <div className={styles.movieInfo}>
                                <h3>{movie.title}</h3>
                                <p><strong>Đạo diễn:</strong> {movie.director}</p>
                                <p><strong>Diễn viên:</strong> {movie.actors || 'Chưa cập nhật'}</p>
                                <p><strong>Thể loại:</strong> {movie.genre}</p>
                                <p>
                                    <strong>Phiên bản:</strong>{' '}
                                    {movie.versions ? movie.versions.split(',').map((v, i) => (
                                        <span key={i} className={styles.versionTag}>{v}</span>
                                    )) : <span className={styles.versionTag}>Phụ Đề</span>}
                                </p>

                                <p>
                                    <strong>Thời lượng:</strong> {movie.duration} phút | {' '}
                                    <strong>Phân loại:</strong> <span className={styles.badge}>{movie.rating}</span>
                                </p>
                                <p><strong>Trailer Code:</strong> {movie.trailer_code || 'N/A'}</p>
                                <p><strong>Khởi chiếu:</strong> {new Date(movie.release_date).toLocaleDateString('vi-VN')}</p>
                                <p><strong>Ngày kết thúc:</strong> {movie.end_date ? new Date(movie.end_date).toLocaleDateString('vi-VN') : 'Chưa xác định'}</p>
                                <p className={styles.descriptionText}>
                                    <strong>Mô tả:</strong> {movie.description.substring(0, 50)}...
                                </p>
                            </div>
                        </td>
                        <td>
                            <div className={styles.statusLabelCell}>
                                <span className={movie.status === 'Published' ? styles.statusPub : styles.statusDraft}>
                                    {movie.status === 'Published' ? 'Đã xuất bản' : 'Bản nháp'}
                                </span>
                            </div>
                        </td>

                        {/* Cột HOẠT ĐỘNG: Chứa nút Switch gạt */}
                        <td>
                            <div className={styles.actionSwitchCell}>
                                <MovieStatusSwitch
                                    movieId={movie.id}
                                    currentStatus={movie.status}
                                    onUpdate={onRefresh}
                                />
                            </div>
                        </td>
                        <td>
                            <div className={styles.hotCell}>
                                <label className={styles.switch}>
                                    <input
                                        type="checkbox"
                                        checked={Number(movie.is_hot) === 1}
                                        onChange={() => handleToggleHot(movie.id, movie.is_hot)}
                                    />
                                    <span className={`${styles.slider} ${styles.round}`}></span>
                                </label>
                            </div>
                        </td>
                        <td className={styles.actionsCell}>
                            {/* Nút Sửa/Xóa/Switch */}
                            <button
                                className={styles.btnEdit}
                                onClick={() => navigate(`/admin/movies/edit/${movie.id}`)}
                            >
                                ✎
                            </button>
                            <button
                                className={styles.btnDelete}
                                onClick={() => handleDelete(movie.id, movie.title)}
                            >
                                🗑
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default AdminMovieTable;