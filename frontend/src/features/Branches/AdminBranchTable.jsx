import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import styles from './AdminBranchTable.module.css';
import BranchStatusSwitch from './BranchStatusSwitch'; // Cùng thư mục nên dùng ./

const AdminBranchTable = ({ branches, onEdit, onDelete, onToggleStatus }) => {
    const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN');

    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Tên chi nhánh</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody>
                {branches.map((branch, index) => (
                    <tr key={branch.id}>
                        <td>{index + 1}</td>
                        <td className={styles.branchName}>{branch.name}</td>
                        <td>
                            <BranchStatusSwitch
                                isActive={branch.is_active === 1}
                                onToggle={() => onToggleStatus(branch.id, branch.is_active)}
                            />
                        </td>
                        <td>{formatDate(branch.created_at)}</td>
                        <td>
                            <div className={styles.actionGroup}>
                                <button onClick={() => onEdit(branch)} className={styles.editBtn}><Edit3 size={14} /></button>
                                <button onClick={() => onDelete(branch.id)} className={styles.deleteBtn}><Trash2 size={14} /></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default AdminBranchTable;