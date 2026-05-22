import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import comboApi from '../../../api/comboApi';
import styles from './AdminComboTable.module.css';

const AdminComboTable = ({ onAddNew, onEdit }) => {
    const [combos, setCombos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Tải danh sách combo
    const loadCombos = async () => {
        try {
            const res = await comboApi.getAll();
            if (res.success) {
                setCombos(res.data);
            }
        } catch (err) {
            console.error("Lỗi tải combo:", err);
        }
    };

    useEffect(() => {
        loadCombos();
    }, []);

    // 2. Xử lý xóa combo
    const handleDelete = async (id, name) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa combo "${name}" không?`)) {
            try {
                const res = await comboApi.delete(id);
                if (res.success) {
                    alert("Xóa thành công!");
                    loadCombos(); // Tải lại danh sách sau khi xóa
                }
            } catch (err) {
                alert("Lỗi khi xóa: " + (err.response?.data?.message || err.message));
            }
        }
    };

    // 3. Lọc danh sách theo từ khóa tìm kiếm
    const filteredCombos = combos.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.searchBar}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tên combo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className={styles.btnAdd} onClick={onAddNew}>
                    <Plus size={18} /> Thêm combo mới
                </button>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tên Combo</th>
                            <th>Hình ảnh</th>
                            <th>Thành phần (Món lẻ)</th>
                            <th>Giá bán</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCombos.length > 0 ? (
                            filteredCombos.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className={styles.comboName}>
                                            <strong>{item.name}</strong>
                                            <p className={styles.descText}>{item.description}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.imgContainer}>
                                            <img
                                                src={`http://localhost:5000${item.image}`}
                                                className={styles.img}
                                                alt={item.name}
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/80x50?text=No+Image'}
                                            />
                                        </div>
                                    </td>
                                    <td className={styles.infoCell}>
                                        {item.foods && item.foods.map((f, i) => (
                                            f.id && ( // Chỉ render nếu food_id tồn tại
                                                <div key={i} className={styles.foodItem}>
                                                    • {f.name} <span className={styles.qty}>x{f.quantity}</span>
                                                </div>
                                            )
                                        ))}
                                    </td>
                                    <td className={styles.price}>
                                        {Number(item.sale_price).toLocaleString()}đ
                                        {item.original_price > item.sale_price && (
                                            <div className={styles.originalPrice}>
                                                {Number(item.original_price).toLocaleString()}đ
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${item.status === 'active' ? styles.active : styles.inactive}`}>
                                            {item.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.btnEdit}
                                                onClick={() => onEdit(item)}
                                                title="Sửa combo"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                className={styles.btnDelete}
                                                onClick={() => handleDelete(item.id, item.name)}
                                                title="Xóa combo"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className={styles.noData}>Không tìm thấy combo nào</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminComboTable;