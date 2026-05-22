import React, { useState, useEffect } from 'react';
import * as roomApi from '../../../api/roomApi';
import styles from './PriceForm.module.css';

const PriceForm = ({ onSave }) => {
    const initialConfig = { type: 'seat', names: [], extraFee: 0 };
    const [config, setConfig] = useState(initialConfig);

    const [dynamicSuggestions, setDynamicSuggestions] = useState({
        seat: ["Ghế VIP", "Ghế Đôi"],
        format: [],
        movie: ["Phim Bom Tấn", "Phim Tết", "Sự Kiện Đặc Biệt"],
        customer: ["HSSV", "Trẻ em", "Người cao tuổi"]
    });

    useEffect(() => {
        const fetchFormats = async () => {
            try {
                const res = await roomApi.getRoomTypes();
                if (res.data) {
                    const filteredFormats = res.data.filter(type => type !== '2D');
                    setDynamicSuggestions(prev => ({
                        ...prev,
                        format: filteredFormats
                    }));
                }
            } catch (err) {
                console.error("Lỗi lấy room types:", err);
                setDynamicSuggestions(prev => ({
                    ...prev,
                    format: ["3D", "IMAX"]
                }));
            }
        };
        fetchFormats();
    }, []);

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setConfig(prev => ({
            ...prev,
            type: newType,
            names: []
        }));
    };

    const handleNameToggle = (name) => {
        setConfig(prev => {
            const isSelected = prev.names.includes(name);
            return {
                ...prev,
                names: isSelected
                    ? prev.names.filter(n => n !== name)
                    : [...prev.names, name]
            };
        });
    };

    // Hàm chặn các ký tự không phải số nguyên
    const handleKeyDown = (e) => {
        if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
            e.preventDefault();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (config.names.length === 0) return alert("Vui lòng chọn ít nhất một đối tượng!");

        const finalFee = Math.floor(Number(config.extraFee));
        if (finalFee <= 0) return alert("Vui lòng nhập số tiền phụ thu hợp lệ!");

        const itemsToSave = config.names.map(name => ({
            type: config.type,
            // Loại bỏ dấu phẩy nếu chẳng may có trong tên (để an toàn cho hàm split ở FE)
            name: name.replace(/,/g, ''),
            extra_fee: finalFee
        }));

        onSave(itemsToSave);
        setConfig({ ...initialConfig, type: config.type });
    };

    return (
        <div className={styles.formContainer}>
            <header className={styles.formHeader}>
                <h3 className={styles.title}>Thêm Quy Tắc Phụ Thu</h3>
                <p className={styles.subtitle}>Thiết lập mức giá chênh lệch cho từng loại dịch vụ</p>
            </header>

            <form onSubmit={handleSubmit} className={styles.grid}>
                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="price-type">Loại biến động</label>
                    <select
                        id="price-type"
                        className={styles.select}
                        value={config.type}
                        onChange={handleTypeChange}
                    >
                        <option value="seat">Loại Ghế (VIP, Đôi...)</option>
                        <option value="format">Định dạng Phim (3D, IMAX...)</option>
                        <option value="movie">Tính chất Phim (Bom tấn, Tết...)</option>
                        <option value="customer">Đối tượng khách hàng</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Tên áp dụng (Chọn từ danh sách)</label>
                    <div className={styles.tagCloud}>
                        {dynamicSuggestions[config.type]?.map(suggestion => {
                            const isActive = config.names.includes(suggestion);
                            return (
                                <button
                                    key={suggestion}
                                    type="button"
                                    className={`${styles.tag} ${isActive ? styles.tagActive : ''}`}
                                    onClick={() => handleNameToggle(suggestion)}
                                >
                                    {suggestion}
                                    {isActive && <span className={styles.tagClose}>×</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label} htmlFor="extra-fee">Số tiền phụ thu (+ VNĐ)</label>
                    <div className={styles.inputWrapper}>
                        <input
                            id="extra-fee"
                            type="number"
                            className={styles.input}
                            placeholder="Ví dụ: 10000"
                            min="0"
                            step="1000"
                            value={config.extraFee || ''}
                            onKeyDown={handleKeyDown} // Chặn phím đặc biệt và dấu thập phân
                            onChange={(e) => {
                                const val = e.target.value;
                                setConfig(prev => ({
                                    ...prev,
                                    // Chuyển đổi sang số nguyên ngay lập tức
                                    extraFee: val === '' ? '' : Math.abs(parseInt(val, 10))
                                }));
                            }}
                        />
                        <span className={styles.currencyUnit}>VNĐ</span>
                    </div>
                    <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                        * Tiền phụ thu sẽ được cộng trực tiếp vào giá vé sàn.
                    </small>
                </div>

                <footer className={styles.formActions}>
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={config.names.length === 0 || !config.extraFee}
                    >
                        Xác nhận thêm {config.names.length > 0 && `(${config.names.length})`} mục
                    </button>
                </footer>
            </form>
        </div>
    );
};

export default PriceForm;