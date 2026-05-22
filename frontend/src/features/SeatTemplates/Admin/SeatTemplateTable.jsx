import React from 'react';
import { useNavigate } from 'react-router-dom';
import SeatTemplateStatus from './SeatTemplateStatus';
import styles from './SeatTemplateTable.module.css';

const SeatTemplateTable = ({ templates, onEdit, onDelete, onToggleStatus }) => {
    const navigate = useNavigate();
    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Tên Mẫu</th>
                    <th>Mô Tả</th>
                    <th>Ma Trận Ghế</th>
                    <th>Trạng thái</th>
                    <th>Hoạt động</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {templates.map((t, index) => (
                    <tr key={t.id}>
                        <td>{index + 1}</td>
                        <td>
                            <div className={styles.templateName}>{t.name}</div>
                            <button
                                className={styles.viewLink}
                                onClick={() => navigate(`/admin/seat-template/editor/${t.id}`)}
                            >
                                Xem sơ đồ ghế
                            </button>
                        </td>
                        <td>{t.description}</td>
                        <td>{t.matrix_size}</td>
                        <td>
                            <SeatTemplateStatus status={t.is_active} />
                        </td>
                        <td>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={t.is_active}
                                    onChange={() => onToggleStatus(t.id, !t.is_active)}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </td>
                        <td>
                            <button onClick={() => onEdit(t)} className={styles.btnEdit}>✎</button>
                            <button onClick={() => onDelete(t.id)} className={styles.btnDelete}>🗑</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default SeatTemplateTable;