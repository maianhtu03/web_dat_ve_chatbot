import React, { useState, useEffect, useCallback } from 'react';
import AdminRoomTable from '../../../features/Rooms/Admin/AdminRoomTable';
import RoomForm from '../../../features/Rooms/Admin/RoomForm';
import { getRooms, deleteRoom, updateRoomStatus } from '../../../api/roomApi';
import styles from './RoomList.module.css';

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loading, setLoading] = useState(false);

    // 1. Sử dụng useCallback để "ghi nhớ" hàm, tránh gây ra cascading renders
    const fetchRooms = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getRooms();
            // Dữ liệu từ API khớp với cấu trúc bảng: id, cinema_id, name, capacity...
            setRooms(res.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách phòng chiếu:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. useEffect giờ đây có thể theo dõi fetchRooms một cách an toàn
    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    // 3. Xử lý xóa phòng
    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa phòng chiếu này không?')) {
            try {
                await deleteRoom(id);
                fetchRooms(); // Tải lại danh sách sau khi xóa
            } catch {
                alert("Xóa không thành công!");
            }
        }
    };

    // 4. Xử lý thay đổi trạng thái (is_active)
    const handleStatusChange = async (id, status) => {
        try {
            await updateRoomStatus(id, status);
            fetchRooms(); // Cập nhật lại UI sau khi đổi trạng thái
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Danh sách phòng chiếu</h1>
                <button
                    className={styles.addBtn}
                    onClick={() => { setSelectedRoom(null); setIsFormOpen(true); }}
                >
                    + Tạo phòng chiếu
                </button>
            </div>

            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <AdminRoomTable
                    rooms={rooms}
                    onEdit={(room) => {
                        setSelectedRoom(room);
                        setIsFormOpen(true);
                    }}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                />
            )}

            {/* Modal Form hiển thị khi thêm hoặc sửa */}
            {isFormOpen && (
                <RoomForm
                    initialData={selectedRoom}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        fetchRooms();
                    }}
                />
            )}
        </div>
    );
};

export default RoomList;