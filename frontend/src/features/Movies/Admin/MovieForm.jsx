import React, { useState, useEffect } from 'react';
import styles from './MovieForm.module.css';
import { movieApi } from '../../../api/movieApi'; // Đưa import lên đầu cho sạch
import Select from 'react-select';
// Định nghĩa các lựa chọn cho phiên bản
const versionOptions = [
    { value: 'Phụ Đề', label: 'Phụ Đề' },
    { value: 'Thuyết Minh', label: 'Thuyết Minh' },
    { value: 'Lồng Tiếng', label: 'Lồng Tiếng' }
];
const MovieForm = ({ initialData, onSubmitSuccess, onClose }) => {
    const defaultState = {
        title: '',
        director: '',
        actors: '',
        genre: '',
        rating: 'P',
        duration: '',
        language: '',
        description: '',
        release_date: '',
        end_date: '',
        trailer_code: '',
        is_hot: 0,
        versions: '',
        status: 'Published'
    };

    const [formData, setFormData] = useState(defaultState);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState('');

    useEffect(() => {
        if (initialData && initialData.id !== formData.id) {
            setFormData({
                ...defaultState,
                ...initialData,
                language: initialData.language || '',
                release_date: initialData.release_date ? initialData.release_date.split('T')[0] : '',
                end_date: initialData.end_date ? initialData.end_date.split('T')[0] : ''
            });
            if (initialData.poster) {
                setPreview(`http://localhost:5000${initialData.poster}`);
            }
        }
    }, [initialData]);
    const handleVersionChange = (selectedOptions) => {
        // Chuyển mảng object [{value, label}] thành chuỗi "Phụ Đề,Thuyết Minh" để lưu DB
        const values = selectedOptions ? selectedOptions.map(opt => opt.value).join(',') : '';
        setFormData(prev => ({ ...prev, versions: values }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    // --- PHẦN SỬA QUAN TRỌNG NHẤT ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Tạo đối tượng FormData (Bắt buộc để upload file)
        const submissionData = new FormData();

        // 2. Append tất cả các trường text từ formData vào FormData object
        Object.keys(formData).forEach(key => {
            // Lưu ý: MySQL không thích giá trị null/undefined gửi dưới dạng string "null"
            if (formData[key] !== null && formData[key] !== undefined) {
                submissionData.append(key, formData[key]);
            }
        });

        // 3. Append file ảnh vào với key là 'poster' (phải khớp với backend)
        if (selectedFile) {
            submissionData.append('poster', selectedFile);
        }

        try {
            if (formData.id) {
                // Cập nhật: truyền submissionData thay vì formData
                await movieApi.update(formData.id, submissionData);
                alert("Cập nhật phim thành công!");
            } else {
                // Thêm mới: truyền submissionData thay vì formData
                await movieApi.create(submissionData);
                alert("Thêm phim mới thành công!");
            }
            onSubmitSuccess();
        } catch (error) {
            console.error("Lỗi chi tiết:", error.response?.data);
            alert("Lỗi: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
                {/* Tên phim */}
                <div className={styles.inputGroup}>
                    <label>Tên phim *</label>
                    <input name="title" value={formData.title} onChange={handleChange} required />
                </div>

                {/* Đạo diễn */}
                <div className={styles.inputGroup}>
                    <label>Đạo diễn</label>
                    <input name="director" value={formData.director} onChange={handleChange} />
                </div>

                {/* Diễn viên */}
                <div className={styles.inputGroup}>
                    <label>Diễn viên</label>
                    <input name="actors" value={formData.actors} onChange={handleChange} placeholder="Cách nhau bởi dấu chấm phẩy (;)" />
                </div>

                {/* Thể loại */}
                <div className={styles.inputGroup}>
                    <label>Thể loại</label>
                    <input name="genre" value={formData.genre} onChange={handleChange} />
                </div>

                {/* Độ tuổi */}
                <div className={styles.threeColRow}>
                    <div className={styles.inputGroup}>
                        <label>Phân loại độ tuổi</label>
                        <select name="rating" value={formData.rating} onChange={handleChange}>
                            <option value="P">P - Mọi lứa tuổi</option>
                            <option value="K">K - Dưới 13 tuổi (có người giám hộ)</option>
                            <option value="T13">T13 - Trên 13 tuổi</option>
                            <option value="T16">T16 - Trên 16 tuổi</option>
                            <option value="T18">T18 - Trên 18 tuổi</option>
                        </select>
                    </div>


                    {/* Thời lượng */}
                    <div className={styles.inputGroup}>
                        <label>Thời lượng (phút)</label>
                        <input type="number" name="duration" value={formData.duration} onChange={handleChange} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Ngôn ngữ gốc *</label>
                        <input
                            type="text"
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            placeholder="Ví dụ: Tiếng Anh, Tiếng Việt..."
                            required
                        />
                    </div>
                </div>
                {/* Trailer */}
                <div className={styles.inputGroup}>
                    <label>Mã Trailer (Youtube ID)</label>
                    <input name="trailer_code" value={formData.trailer_code} onChange={handleChange} placeholder="Ví dụ: RWZ5psmKxDk" />
                </div>



                {/* Trạng thái HOT */}
                <div className={styles.inputGroup}>
                    <label>Trạng thái HOT</label>
                    <div className={styles.switchContainer}>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                name="is_hot"
                                checked={Number(formData.is_hot) === 1}
                                onChange={handleChange}
                            />
                            <span className={styles.slider}></span>
                        </label>
                        <span className={styles.switchText}>
                            {Number(formData.is_hot) === 1 ? 'Phim HOT' : 'Bình thường'}
                        </span>
                    </div>
                </div>

                {/* Ngày chiếu */}
                <div className={styles.inputGroup}>
                    <label>Ngày khởi chiếu</label>
                    <input type="date" name="release_date" value={formData.release_date} onChange={handleChange} />
                </div>

                {/* Ngày kết thúc */}
                <div className={styles.inputGroup}>
                    <label>Ngày kết thúc (dự kiến)</label>
                    <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
                </div>

                {/* --- PHẦN POSTER MỚI --- */}
                <div className={styles.inputGroupFull}>
                    <label>Hình ảnh (Poster Phim):</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ border: 'none', padding: '10px 0', display: 'block' }}
                    />
                    {preview && (
                        <div style={{ marginTop: '10px' }}>
                            <img src={preview} alt="Preview" style={{ width: '120px', borderRadius: '8px', border: '1px solid #ddd', padding: '4px' }} />
                            <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0 0' }}>Ảnh đang được chọn</p>
                        </div>
                    )}
                </div>

                {/* Phiên bản phim */}
                <div className={styles.inputGroupFull} style={{ marginBottom: '15px' }}>
                    <label>Phiên bản (Chọn nhiều)</label>
                    <Select
                        isMulti
                        name="versions"
                        options={versionOptions}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder="Chọn phiên bản..."
                        // Chuyển chuỗi từ formData ngược lại thành mảng object cho React-Select hiển thị
                        value={formData.versions ? formData.versions.split(',').map(v => ({ value: v, label: v })) : []}
                        onChange={handleVersionChange}
                        styles={{
                            control: (base) => ({
                                ...base,
                                marginTop: '8px',
                                borderRadius: '4px',
                                borderColor: '#ccc'
                            })
                        }}
                    />
                </div>

                {/* Mô tả */}
                <div className={styles.inputGroupFull}>
                    <label>Mô tả phim</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="4" style={{ width: '100%', padding: '8px' }} />
                </div>
            </div>

            {/* --- PHẦN NÚT HÀNH ĐỘNG ĐÃ SỬA --- */}
            <div className={styles.actions}>
                <button type="button" className={styles.btnCancel} onClick={onClose || onSubmitSuccess}>
                    HỦY BỎ
                </button>
                <button type="submit" className={styles.btnSave}>
                    LƯU THÔNG TIN PHIM
                </button>
            </div>
        </form>
    );
};

export default MovieForm;