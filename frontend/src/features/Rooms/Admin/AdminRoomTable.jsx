import React from 'react';
import RoomStatusSwitch from './RoomStatusSwitch';
import styles from './AdminRoomTable.module.css';

const AdminRoomTable = ({ rooms, onEdit, onDelete, onStatusChange }) => {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Phòng chiếu</th>
                        <th>Rạp chiếu</th>
                        <th>Loại Phòng</th>
                        <th>Sức chứa</th>
                        <th>Trạng thái</th>
                        <th>Hoạt động</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {rooms.map((room, index) => (
                        <tr key={room.id}>
                            <td>{index + 1}</td>
                            <td className={styles.roomCell}>
                                <div className={styles.roomName}>{room.name}</div>
                                <a href={`/admin/rooms/seats/${room.id}`} className={styles.viewSeats}>
                                    Xem sơ đồ ghế
                                </a>
                            </td>
                            <td>{room.cinema_name}</td>
                            <td>{room.room_type}</td>
                            <td className={styles.capacityText}>
                                {room.actual_capacity || 0} / {room.actual_capacity || 0} Ghế
                            </td>
                            <td>
                                <span className={room.is_active === 1 ? styles.badgeActive : styles.badgeDraft}>
                                    {room.is_active === 1 ? 'Đã xuất bản' : 'Tạm dừng'}
                                </span>
                            </td>
                            <td>
                                <RoomStatusSwitch
                                    checked={room.is_active === 1}
                                    onChange={(val) => onStatusChange(room.id, val ? 1 : 0)}
                                />
                            </td>
                            <td className={styles.actions}>
                                <button className={styles.editBtn} onClick={() => onEdit(room)}>✎</button>
                                <button className={styles.deleteBtn} onClick={() => onDelete(room.id)}>🗑</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminRoomTable;