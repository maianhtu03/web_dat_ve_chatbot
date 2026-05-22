import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, DollarSign, Tag } from 'lucide-react';
import foodApi from '../../../api/foodApi';
import styles from './AdminFoodTable.module.css';

const FoodForm = ({ initialValues, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'Đồ uống',
        price: '' // Lưu giá trị số nguyên nguyên bản
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const fileInputRef = useRef(null);

    // Hiển thị giá có dấu chấm: 50000 -> 50.000
    const formatInputPrice = (value) => {
        if (!value) return '';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // Khi người dùng nhập giá
    const handlePriceChange = (e) => {
        const value = e.target.value.replace(/\./g, ''); // Loại bỏ dấu chấm để lấy số nguyên
        if (!isNaN(value)) {
            setFormData({ ...formData, price: value });
        }
    };

    useEffect(() => {
        if (initialValues) {
            setFormData({
                name: initialValues.name,
                type: initialValues.type,
                price: initialValues.price.toString()
            });
            setPreview(initialValues.image);
        }
    }, [initialValues]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (preview && preview.startsWith('blob')) URL.revokeObjectURL(preview);
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleRemoveImage = (e) => {
        e.preventDefault();
        if (preview && preview.startsWith('blob')) URL.revokeObjectURL(preview);
        setFile(null);
        setPreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('type', formData.type);
        data.append('price', formData.price);

        if (file) {
            data.append('image', file);
        } else if (initialValues && preview) {
            data.append('image', initialValues.image);
        }

        try {
            if (initialValues) {
                await foodApi.update(initialValues.id, data);
            } else {
                data.append('status', 'active');
                await foodApi.create(data);
            }
            onSuccess();
        } catch (err) {
            alert("Lỗi khi lưu dữ liệu đồ ăn");
        }
    };

    return (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
                <label><Tag size={14} /> Tên đồ ăn</label>
                <input
                    type="text"
                    className={styles.mainInput}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Pepsi, Bắp rang..."
                    required
                />
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label>Loại</label>
                    <select
                        className={styles.mainSelect}
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="Đồ uống">🥤 Đồ uống</option>
                        <option value="Đồ ăn">🍿 Đồ ăn</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label><DollarSign size={14} /> Giá (VNĐ)</label>
                    <div className={styles.priceInputWrapper}>
                        <input
                            type="text"
                            value={formatInputPrice(formData.price)}
                            onChange={handlePriceChange}
                            placeholder="35.000"
                            required
                        />
                        <span className={styles.currency}>đ</span>
                    </div>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>Hình ảnh món ăn</label>
                <div className={styles.uploadArea}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        id="food-image"
                        ref={fileInputRef}
                        hidden
                    />
                    <div className={styles.imagePreviewContainer}>
                        <label htmlFor="food-image" className={`${styles.uploadLabel} ${preview ? styles.hasPreview : ''}`}>
                            {preview ? (
                                <img
                                    src={preview.startsWith('blob') ? preview : `http://localhost:5000${preview}`}
                                    alt="Preview"
                                    className={styles.previewImg}
                                />
                            ) : (
                                <div className={styles.uploadPlaceholder}>
                                    <Upload size={24} />
                                    <span>Chọn ảnh</span>
                                </div>
                            )}
                        </label>

                        {preview && (
                            <button type="button" className={styles.removeImageBtn} onClick={handleRemoveImage}>
                                <X size={12} />
                            </button>
                        )}
                    </div>
                    <div className={styles.uploadHint}>
                        <p>Dung lượng tối đa: 2MB</p>
                        <p>Định dạng: JPG, PNG, WEBP</p>
                    </div>
                </div>
            </div>

            <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={onCancel}>Bỏ qua</button>
                <button type="submit" className={styles.saveBtn}>Lưu thông tin</button>
            </div>
        </form>
    );
};

export default FoodForm;