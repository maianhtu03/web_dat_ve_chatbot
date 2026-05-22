import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import foodApi from '../../../api/foodApi';
import FoodForm from './FoodForm';
import styles from './AdminFoodTable.module.css';

const AdminFoodTable = () => {
    const [foods, setFoods] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFood, setEditingFood] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const loadFoods = async () => {
        try {
            const res = await foodApi.getAll();
            // res bây giờ chính là { success: true, data: [...] } nhờ có interceptor
            if (res && res.success) {
                // Kiểm tra xem res.data có phải là mảng không
                setFoods(Array.isArray(res.data) ? res.data : []);
            } else {
                setFoods([]);
            }
        } catch (err) {
            console.error("Lỗi khi tải danh sách đồ ăn:", err);
            setFoods([]);
        }
    };

    useEffect(() => {
        loadFoods();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa món này không?")) {
            try {
                const res = await foodApi.delete(id);
                if (res.success) {
                    loadFoods();
                } else {
                    alert("Xóa thất bại: " + res.message);
                }
            } catch (err) {
                console.error(err);
                alert("Lỗi khi xóa đồ ăn");
            }
        }
    };

    const filteredFoods = Array.isArray(foods)
        ? foods.filter(item =>
            item && item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    return (
        <div className={styles.container}>
            <div className={styles.tableHeader}>
                <div className={styles.searchBox}>
                    <Search size={18} />
                    <input type="text"
                        placeholder="Tìm kiếm đồ ăn..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <button
                    className={styles.btnAdd}
                    onClick={() => { setEditingFood(null); setIsModalOpen(true); }}
                >
                    <Plus size={18} /> Thêm đồ ăn
                </button>
            </div>

            <table className={styles.customTable}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Tên đồ ăn</th>
                        <th>Loại</th>
                        <th>Hình ảnh</th>
                        <th>Giá</th>
                        <th>Hoạt động</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredFoods.length > 0 ? (
                        filteredFoods.map((item, index) => (
                            <tr key={item.id || index}>
                                <td>{index + 1}</td>
                                <td>{item.name}</td>
                                <td>{item.type}</td>
                                <td>
                                    {item.image ? (
                                        <img
                                            src={`http://localhost:5000${item.image}`}
                                            className={styles.foodImg}
                                            alt={item.name}
                                            // Fix lỗi nếu ảnh không tồn tại trên server
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
                                        />
                                    ) : (
                                        <div className={styles.noImg}>No image</div>
                                    )}
                                </td>
                                <td className={styles.priceText}>
                                    {Number(item.price).toLocaleString('vi-VN')} đ
                                </td>
                                <td>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={item.status === 'active'}
                                            onChange={() => { }}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button
                                            className={styles.btnEdit}
                                            onClick={() => { setEditingFood(item); setIsModalOpen(true); }}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            className={styles.btnDelete}
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                                Không tìm thấy dữ liệu món ăn nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>{editingFood ? "Cập nhật đồ ăn" : "Thêm đồ ăn mới"}</h3>
                        </div>
                        <FoodForm
                            initialValues={editingFood}
                            onSuccess={() => { setIsModalOpen(false); loadFoods(); }}
                            onCancel={() => setIsModalOpen(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFoodTable;