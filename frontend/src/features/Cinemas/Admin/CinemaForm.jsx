import React, { useState, useEffect, useRef } from 'react';
import { getActiveBranches } from "../../../api/branchApi";
import { Upload, X, MapPin, Phone, Info } from 'lucide-react';
import styles from './CinemaForm.module.css';

const BASE_URL = "http://localhost:5000";

const CinemaForm = ({ onClose, onSubmit, initialData }) => {
    // 1. Khởi tạo state bao gồm các trường mới
    const [formData, setFormData] = useState(initialData || {
        name: '',
        branch_id: '',
        address: '',
        description: '',
        hotline: '',
        map_iframe: '',
        is_active: 1
    });

    const [branches, setBranches] = useState([]);
    const [file, setFile] = useState(null); // State lưu file ảnh mới chọn
    const [preview, setPreview] = useState(initialData?.image_url || ''); // Preview ảnh
    const fileInputRef = useRef(null);

    useEffect(() => {
        getActiveBranches()
            .then(res => setBranches(res.data))
            .catch(err => console.error("Lỗi load chi nhánh:", err));
    }, []);

    // 2. Xử lý khi chọn file ảnh
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile)); // Tạo link preview tạm thời
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 3. QUAN TRỌNG: Chuyển dữ liệu sang FormData để gửi được file
        const data = new FormData();
        data.append('name', formData.name);
        data.append('branch_id', formData.branch_id);
        data.append('address', formData.address);
        data.append('description', formData.description || '');
        data.append('hotline', formData.hotline || '');
        data.append('map_iframe', formData.map_iframe || '');
        data.append('is_active', formData.is_active);

        if (file) {
            data.append('image_url', file); // Nếu có chọn ảnh mới
        } else if (initialData?.image_url) {
            data.append('image_url', initialData.image_url); // Giữ ảnh cũ nếu không chọn mới
        }

        // Trả FormData về hàm onSubmit ở file cha (Cinema.jsx)
        onSubmit(data);
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.pageHeader}>
                <h3>{initialData ? 'CẬP NHẬT RẠP CHIẾU' : 'THÊM MỚI RẠP CHIẾU'}</h3>
                <div className={styles.breadcrumb}>Quản lý &gt; <span>{initialData ? 'Cập nhật' : 'Thêm mới'} rạp</span></div>
            </div>

            <form className={styles.formLayout} onSubmit={handleSubmit}>
                {/* Cột trái: Thông tin chính */}
                <div className={styles.leftCol}>
                    <div className={styles.card}>
                        <div className={styles.row}>
                            <div className={styles.group}>
                                <label>Tên rạp *</label>
                                <input
                                    value={formData.name}
                                    placeholder="Nhập tên rạp..."
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.group}>
                                <label>Chi nhánh</label>
                                <select
                                    value={formData.branch_id}
                                    onChange={e => setFormData({ ...formData, branch_id: e.target.value })}
                                    required
                                >
                                    <option value="">Chọn chi nhánh</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.group}>
                                <label>Địa chỉ *</label>
                                <input
                                    value={formData.address}
                                    placeholder="Nhập địa chỉ..."
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.group}>
                                <label>Hotline</label>
                                <input
                                    value={formData.hotline || ''}
                                    placeholder="Số điện thoại..."
                                    onChange={e => setFormData({ ...formData, hotline: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className={styles.group}>
                            <label>Mã nhúng bản đồ (Google Maps)</label>
                            <textarea
                                value={formData.map_iframe || ''}
                                rows="3"
                                placeholder='Dán thẻ <iframe> từ Google Maps vào đây...'
                                onChange={e => setFormData({ ...formData, map_iframe: e.target.value })}
                            />
                        </div>

                        <div className={styles.group}>
                            <label>Mô tả</label>
                            <textarea
                                value={formData.description || ''}
                                rows="4"
                                placeholder="Mô tả về rạp..."
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>Quay lại</button>
                        <button type="submit" className={styles.submitBtn}>Submit</button>
                    </div>
                </div>

                {/* Cột phải: Ảnh và Trạng thái */}
                <div className={styles.rightCol}>
                    {/* Card Upload Ảnh */}
                    <div className={styles.card}>
                        <label className={styles.cardLabel}>Ảnh rạp phim</label>
                        <div className={styles.uploadBox} onClick={() => fileInputRef.current.click()}>
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                            {preview ? (
                                <div className={styles.previewWrap}>
                                    <img
                                        src={preview.startsWith('blob') ? preview : `${BASE_URL}${preview}`}
                                        alt="Preview"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://placehold.co/200x120?text=Error';
                                        }}
                                    />
                                    <div className={styles.changeOverlay}>Thay đổi ảnh</div>
                                </div>
                            ) : (
                                <div className={styles.uploadPlaceholder}>
                                    <Upload size={30} />
                                    <span>Tải ảnh lên</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card Trạng thái */}
                    <div className={styles.card}>
                        <label className={styles.cardLabel}>Trạng thái</label>
                        <div className={styles.statusRow}>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={Number(formData.is_active) === 1}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                                />
                                <span className={styles.slider}></span>
                            </label>
                            <span className={styles.statusText}>
                                {Number(formData.is_active) === 1 ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                            </span>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CinemaForm;