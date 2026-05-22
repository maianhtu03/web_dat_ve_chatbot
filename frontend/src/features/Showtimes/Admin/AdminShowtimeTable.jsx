import React, { useState, useEffect } from 'react'; // Thêm useEffect
import { Trash2, Edit, Calendar, MapPin, Plus, Minus, Eye } from 'lucide-react';
import showtimeApi from '../../../api/showtimeApi';
import styles from './AdminShowtimeTable.module.css';

import { useNavigate } from 'react-router-dom';
const AdminShowtimeTable = ({ data, onReload }) => {
    const BASE_URL = 'http://localhost:5000';
    const navigate = useNavigate();
    const [expandedMovies, setExpandedMovies] = useState([]);

    // BƯỚC 1: Tạo localData để quản lý dữ liệu tại chỗ, tránh load lại cả bảng
    const [localData, setLocalData] = useState(data);

    // Cập nhật localData mỗi khi props 'data' từ cha thay đổi (ví dụ khi thêm mới hoặc xoá)
    useEffect(() => {
        setLocalData(data);
    }, [data]);

    // BƯỚC 2: Nhóm dữ liệu dựa trên localData thay vì data từ props
    const groupedData = localData.reduce((acc, current) => {
        const found = acc.find(item => item.movie_id === current.movie_id);
        if (found) {
            found.showtimes.push(current);
        } else {
            acc.push({
                movie_id: current.movie_id,
                movie_title: current.movie_title,
                poster: current.poster,
                duration: current.duration,
                genre: current.genre || "Chưa xác định",
                showtimes: [current]
            });
        }
        return acc;
    }, []);

    // BƯỚC 3: Sửa hàm này để KHÔNG gọi onReload() khi thay đổi status
    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

        // Cập nhật UI ngay lập tức (Optimistic Update)
        // Việc này giúp hàng con giữ nguyên trạng thái mở
        setLocalData(prev => prev.map(item =>
            item.id === id ? { ...item, status: newStatus } : item
        ));

        try {
            await showtimeApi.updateStatus(id, newStatus);
            // Không gọi onReload() ở đây vì localData đã lo phần hiển thị rồi
        } catch (error) {
            // Nếu lỗi thì hoàn tác lại trạng thái cũ
            setLocalData(prev => prev.map(item =>
                item.id === id ? { ...item, status: currentStatus } : item
            ));
            alert("Lỗi: " + error.message);
        }
    };

    const toggleExpand = (movieId) => {
        setExpandedMovies(prev =>
            prev.includes(movieId) ? prev.filter(id => id !== movieId) : [...prev, movieId]
        );
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa suất chiếu này không?")) {

            const backupData = [...localData];

            // 2. Cập nhật UI ngay lập tức bằng cách lọc bỏ suất chiếu có id này khỏi localData
            // Việc này giúp bảng con giữ nguyên trạng thái mở, không bị reload nhảy trang
            setLocalData(prev => prev.filter(item => item.id !== id));
            try {
                await showtimeApi.delete(id);
                alert("Xóa thành công!");

            } catch (error) {
                setLocalData(backupData);
                alert("Lỗi khi xóa: " + error.message);
            }
        }
    };

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th style={{ width: '50px' }}></th>
                        <th>Phim</th>
                        <th className="text-center">Thời lượng</th>
                        <th>Thể loại</th>
                    </tr>
                </thead>
                <tbody>
                    {groupedData.length > 0 ? (
                        groupedData.map((movie) => (
                            <React.Fragment key={movie.movie_id}>
                                <tr>
                                    <td>
                                        <button
                                            className={styles.expandBtn}
                                            onClick={() => toggleExpand(movie.movie_id)}
                                        >
                                            {expandedMovies.includes(movie.movie_id) ? <Minus size={16} /> : <Plus size={16} />}
                                        </button>
                                    </td>
                                    <td className={styles.movieCell}>
                                        <div className={styles.movieFlex}>
                                            <img
                                                src={
                                                    movie.poster
                                                        ? `${BASE_URL}${movie.poster.startsWith('/') ? '' : '/'}${movie.poster}`
                                                        : 'https://placehold.co/40x60?text=No+Poster'
                                                }
                                                alt={movie.movie_title}
                                                className={styles.posterSmall}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/40x60?text=Error';
                                                }}
                                            />
                                            <div className={styles.movieTitleWrapper}>
                                                <strong className={styles.movieTitleMain}>{movie.movie_title}</strong>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.centerText}><strong>{movie.duration} Phút</strong></td>
                                    <td className={styles.genreText}>{movie.genre}</td>
                                </tr>

                                {expandedMovies.includes(movie.movie_id) && (
                                    <tr className={styles.expandedRow}>
                                        <td colSpan="4" className={styles.expandedCell}>
                                            <div className={styles.innerTableWrapper}>
                                                <table className={styles.innerTable}>
                                                    <thead>
                                                        <tr>
                                                            <th>Thời gian</th>
                                                            <th>Phòng</th>
                                                            <th>Ghế</th>
                                                            <th className="text-center">Định dạng</th>
                                                            <th className="text-center">Hoạt động</th>
                                                            <th className="text-center">Thao tác</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {movie.showtimes.map((st) => (
                                                            <tr key={st.id}>
                                                                <td className={styles.timeHighlight}>
                                                                    {st.start_time.substring(0, 5)} - {st.end_time.substring(0, 5)}
                                                                </td>
                                                                <td>{st.room_name}</td>
                                                                <td className={styles.seatInfo}>
                                                                    {st.booked_seats || 0} / {st.total_seats || 0} Ghế
                                                                </td>
                                                                <td className="text-center">
                                                                    <span className={styles.formatBadge}>{st.format}</span>
                                                                </td>
                                                                <td className="text-center">
                                                                    <div
                                                                        className={`${styles.switch} ${st.status === 'Active' ? styles.active : ''}`}
                                                                        onClick={() => handleStatusToggle(st.id, st.status)}
                                                                        style={{ cursor: 'pointer' }}
                                                                    >
                                                                        <span className={styles.slider}></span>
                                                                    </div>
                                                                </td>
                                                                <td className={styles.textCenter}>
                                                                    <div className={styles.actions}>
                                                                        <button
                                                                            className={styles.btnEdit}
                                                                            onClick={() => navigate(`/admin/showtimes/edit/${st.id}`, { state: { showtimeData: st } })}
                                                                        >
                                                                            <Edit size={14} />
                                                                        </button>
                                                                        <button className={styles.btnDelete} onClick={() => handleDelete(st.id)}><Trash2 size={14} /></button>
                                                                        <button
                                                                            className={styles.btnView}
                                                                            onClick={() => navigate(`/admin/showtimes/${st.id}`)} // Điều hướng đến trang chi tiết theo ID suất chiếu
                                                                            title="Xem chi tiết sơ đồ ghế"
                                                                        >
                                                                            <Eye size={14} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className={styles.noData}>Không tìm thấy phim nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminShowtimeTable;