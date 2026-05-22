import React, { useState, useEffect } from 'react';
import { Plus, Minus, ChevronLeft, X, Upload } from 'lucide-react';
import foodApi from '../../../api/foodApi';
import comboApi from '../../../api/comboApi';
import styles from './ComboForm.module.css';

const ComboForm = ({ onCancel, onSuccess, comboToEdit = null }) => {
    const [foodList, setFoodList] = useState([]);
    const [selectedItems, setSelectedItems] = useState([{ food_id: '', quantity: 1 }]);
    const [formData, setFormData] = useState({
        name: '',
        original_price: 0,
        sale_price: 0,
        description: '',
        status: 'active'
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    // 1. Fetch dữ liệu ban đầu
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await foodApi.getAll();
                if (res.success) setFoodList(res.data);

                if (comboToEdit) {
                    setFormData({
                        name: comboToEdit.name,
                        original_price: comboToEdit.original_price,
                        sale_price: comboToEdit.sale_price,
                        description: comboToEdit.description || '',
                        status: comboToEdit.status || 'active'
                    });
                    const formattedItems = comboToEdit.foods.map(f => ({
                        food_id: f.id.toString(), // Chuyển sang string để khớp value của select
                        quantity: f.quantity
                    }));
                    setSelectedItems(formattedItems);
                    if (comboToEdit.image) setPreview(`http://localhost:5000${comboToEdit.image}`);
                }
            } catch (err) {
                console.error("Lỗi fetch data:", err);
            }
        };
        fetchData();
    }, [comboToEdit]);

    // 2. Logic Quan Trọng: Lọc danh sách món ăn khả dụng cho từng hàng
    const getAvailableFoods = (currentIndex) => {
        // Lấy danh sách ID đã chọn ở các hàng KHÁC hàng hiện tại
        const otherSelectedIds = selectedItems
            .filter((_, index) => index !== currentIndex)
            .map(item => item.food_id)
            .filter(id => id !== '');

        // Trả về danh sách food không nằm trong mảng các ID đã chọn ở hàng khác
        return foodList.filter(food => !otherSelectedIds.includes(food.id.toString()));
    };

    // 3. Tự động tính giá gốc
    useEffect(() => {
        const total = selectedItems.reduce((sum, item) => {
            const food = foodList.find(f => f.id.toString() === item.food_id);
            return sum + (food ? food.price * item.quantity : 0);
        }, 0);
        setFormData(prev => ({ ...prev, original_price: total }));
    }, [selectedItems, foodList]);

    const handleAddItem = () => {
        // Chỉ cho phép thêm nếu vẫn còn món ăn chưa được chọn hết
        if (selectedItems.length < foodList.length) {
            setSelectedItems([...selectedItems, { food_id: '', quantity: 1 }]);
        } else {
            alert("Đã chọn hết tất cả các món ăn có sẵn!");
        }
    };

    const removeRow = (index) => {
        if (selectedItems.length > 1) {
            setSelectedItems(selectedItems.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...selectedItems];
        newItems[index][field] = value;
        setSelectedItems(newItems);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedItems.some(item => !item.food_id)) {
            return alert("Vui lòng chọn đầy đủ các món ăn!");
        }

        const data = new FormData();
        data.append('info', JSON.stringify(formData));
        data.append('items', JSON.stringify(selectedItems));
        if (image) data.append('image', image);

        try {
            const res = comboToEdit
                ? await comboApi.update(comboToEdit.id, data)
                : await comboApi.create(data);

            if (res.success) {
                alert(comboToEdit ? "Cập nhật thành công!" : "Thêm mới thành công!");
                onSuccess();
            }
        } catch {
            alert("Đã có lỗi xảy ra!");
        }
    };

    return (
        <div className={styles.formWrapper}>
            <div className={styles.formHeader}>
                <h2>{comboToEdit ? 'Chỉnh sửa Combo' : 'Thêm Combo mới'}</h2>
                <p>Quản lý thành phần và giá bán của gói Combo</p>
            </div>

            <form className={styles.mainForm} onSubmit={handleSubmit}>
                <div className={styles.leftCol}>
                    <div className={styles.sectionTitle}>
                        <h3>Thành phần món ăn</h3>
                        <button type="button" className={styles.btnRowAdd} onClick={handleAddItem}>
                            <Plus size={16} /> Thêm đồ ăn
                        </button>
                    </div>

                    <div className={styles.foodListContainer}>
                        {selectedItems.map((item, index) => {
                            const availableFoods = getAvailableFoods(index);
                            return (
                                <div key={index} className={styles.foodRowContainer}>
                                    {/* 1. Label hiện số thứ tự món ăn nằm riêng phía trên */}
                                    <label className={styles.rowLabel}>Món ăn {index + 1}</label>

                                    <div className={styles.foodRow}>
                                        {/* 2. Ô chọn món */}
                                        <div className={styles.selectArea}>
                                            <select
                                                value={item.food_id}
                                                onChange={e => updateItem(index, 'food_id', e.target.value)}
                                                required
                                            >
                                                <option value="">-- Chọn món lẻ --</option>
                                                {availableFoods.map(f => (
                                                    <option key={f.id} value={f.id.toString()}>
                                                        {f.name} ({Number(f.price).toLocaleString()}đ)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* 3. Bộ tăng giảm số lượng */}
                                        <div className={styles.qtyBox}>
                                            <button type="button" onClick={() => updateItem(index, 'quantity', Math.max(1, item.quantity - 1))}>
                                                <Minus size={14} />
                                            </button>
                                            <input type="number" value={item.quantity} readOnly />
                                            <button type="button" onClick={() => updateItem(index, 'quantity', item.quantity + 1)}>
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        {/* 4. Nút xóa */}
                                        {selectedItems.length > 1 && (
                                            <button type="button" className={styles.btnRemove} onClick={() => removeRow(index)}>
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className={styles.infoSection}>
                        <div className={styles.inputGroup}>
                            <label>Tên gói Combo</label>
                            <input
                                type="text"
                                value={formData.name}
                                placeholder="Ví dụ: Combo Movie Night"
                                required
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Mô tả</label>
                            <textarea
                                value={formData.description}
                                placeholder="Mô tả ngắn gọn về combo này..."
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className={styles.priceRow}>
                            <div className={styles.inputGroup}>
                                <label>Giá gốc (Tạm tính)</label>
                                <div className={styles.priceDisplay}>{Number(formData.original_price).toLocaleString()} đ</div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Giá bán thực tế</label>
                                <input
                                    type="number"
                                    value={formData.sale_price}
                                    required
                                    onChange={e => setFormData({ ...formData, sale_price: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.rightCol}>
                    <div className={styles.uploadSection}>
                        <label>Hình ảnh Combo</label>
                        <div className={styles.imagePreviewBox}>
                            {preview ? (
                                <img src={preview} alt="Preview" className={styles.previewImg} />
                            ) : (
                                <div className={styles.emptyPreview}>
                                    <Upload size={32} />
                                    <span>Chưa có ảnh</span>
                                </div>
                            )}
                            <input type="file" id="combo-img" hidden onChange={handleImageChange} accept="image/*" />
                            <label htmlFor="combo-img" className={styles.labelUpload}>Chọn ảnh</label>
                        </div>
                    </div>

                    <div className={styles.statusSection}>
                        <label>Trạng thái</label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="active">Đang kinh doanh</option>
                            <option value="inactive">Ngừng bán</option>
                        </select>
                    </div>

                    <div className={styles.footerBtns}>
                        <button type="button" className={styles.btnBack} onClick={onCancel}>
                            <ChevronLeft size={16} /> Quay lại
                        </button>
                        <button type="submit" className={styles.btnSubmit}>
                            {comboToEdit ? 'Lưu cập nhật' : 'Xác nhận thêm'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ComboForm;