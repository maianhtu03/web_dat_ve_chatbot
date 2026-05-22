import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Dùng react-quill-new thay cho react-quill
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import articleApi from "../../../api/articleApi";
import styles from "./ArticleForm.module.css";
import { ImagePlus, Save, XCircle, ArrowLeft } from 'lucide-react';

const ArticleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        short_description: '',
        content: '',
        status: 1,
        thumbnail: null
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);

    // 1. Lấy dữ liệu bài viết nếu là chế độ Chỉnh sửa
    useEffect(() => {
        if (isEdit) {
            const fetchDetail = async () => {
                try {
                    const response = await articleApi.getById(id);
                    if (response.data.success) {
                        const data = response.data.data;
                        setFormData({
                            title: data.title,
                            short_description: data.short_description,
                            content: data.content,
                            status: data.status,
                            thumbnail: null // File mới mặc định là null
                        });
                        // Hiển thị ảnh cũ từ server
                        if (data.thumbnail) {
                            setPreviewImage(`http://localhost:5000${data.thumbnail}`);
                        }
                    }
                } catch (error) {
                    console.error("Lỗi lấy chi tiết bài viết:", error);
                }
            };
            fetchDetail();
        }
    }, [id, isEdit]);

    // 2. Xử lý thay đổi file ảnh
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, thumbnail: file });
            setPreviewImage(URL.createObjectURL(file)); // Tạo link preview tạm thời
        }
    };

    // 3. Xử lý gửi dữ liệu (Add/Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Sử dụng FormData để gửi file lên Backend
        const data = new FormData();
        data.append('title', formData.title);
        data.append('short_description', formData.short_description);
        data.append('content', formData.content);
        data.append('status', formData.status);

        // Chỉ append nếu người dùng chọn file mới
        if (formData.thumbnail) {
            data.append('image', formData.thumbnail);
        }

        try {
            let response;
            if (isEdit) {
                response = await articleApi.update(id, data);
            } else {
                // Lấy author_id từ User đăng nhập
                const user = JSON.parse(localStorage.getItem('user'));
                data.append('author_id', user?.id || 1);
                response = await articleApi.create(data);
            }

            if (response.data.success) {
                alert(isEdit ? "Cập nhật thành công!" : "Đăng bài mới thành công!");
                navigate('/admin/articles');
            }
        } catch {
            alert("Đã có lỗi xảy ra. Vui lòng kiểm tra lại dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formHeader}>
                <button onClick={() => navigate('/admin/articles')} className={styles.btnBack}>
                    <ArrowLeft size={20} /> Quay lại
                </button>
                <h2>{isEdit ? 'Chỉnh sửa bài viết' : 'Đăng bài viết mới'}</h2>
            </div>

            <form className={styles.formLayout} onSubmit={handleSubmit}>
                {/* CỘT TRÁI */}
                <div className={styles.mainContent}>
                    <div className={styles.inputGroup}>
                        <label>Tiêu đề bài viết</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Nhập tiêu đề hấp dẫn..."
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Mô tả ngắn</label>
                        <textarea
                            rows="3"
                            value={formData.short_description}
                            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                            placeholder="Tóm tắt nội dung để thu hút người đọc..."
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Nội dung chi tiết</label>
                        <div className={styles.editorWrapper}>
                            <ReactQuill
                                theme="snow"
                                value={formData.content}
                                onChange={(content) => setFormData({ ...formData, content })}
                                modules={quillModules}
                            />
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI */}
                <div className={styles.sideBar}>
                    <div className={styles.card}>
                        <h3>Ảnh đại diện (Thumbnail)</h3>
                        <div className={styles.uploadArea}>
                            {previewImage ? (
                                <div className={styles.previewContainer}>
                                    <img src={previewImage} alt="preview" />
                                    <label htmlFor="file-upload" className={styles.changeImgBtn}>Thay đổi</label>
                                </div>
                            ) : (
                                <label htmlFor="file-upload" className={styles.placeholder}>
                                    <ImagePlus size={40} />
                                    <span>Tải ảnh lên</span>
                                </label>
                            )}
                            <input
                                id="file-upload"
                                type="file"
                                hidden
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h3>Cấu hình bài viết</h3>
                        <div className={styles.statusRow}>
                            <span>Trạng thái hoạt động</span>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={formData.status === 1}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    </div>

                    <div className={styles.stickyActions}>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/articles')}
                            className={styles.btnCancel}
                        >
                            <XCircle size={18} /> Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            className={styles.btnSave}
                            disabled={loading}
                        >
                            <Save size={18} /> {loading ? 'Đang lưu...' : 'Lưu bài viết'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

// Cấu hình Toolbar cho ReactQuill
const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image', 'video'],
        ['clean']
    ],
};

export default ArticleForm;