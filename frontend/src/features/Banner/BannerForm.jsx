import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import bannerApi from '../../api/bannerApi';
import articleApi from '../../api/articleApi';
import axios from 'axios';
import styles from './BannerForm.module.css';

const BannerForm = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState(true);
    const [description, setDescription] = useState('');
    const [movies, setMovies] = useState([]);
    const [combos, setCombos] = useState([]);
    const [articles, setArticles] = useState([]); // Lưu danh sách bài viết/ưu đãi
    const [imageRows, setImageRows] = useState([
        { id: 1, file: null, preview: null, fileName: 'Chưa chọn tệp', linkType: 'none', targetId: '', externalUrl: '' }
    ]);

    // 1. Sửa lỗi lấy dữ liệu phim/combo
    const { id } = useParams(); // Lấy ID từ URL: /admin/banners/edit/:id

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Lấy danh sách phim/combo cho dropdown
                const [resMovies, resCombos, resArticles] = await Promise.all([
                    axios.get('http://localhost:5000/api/movies'),
                    axios.get('http://localhost:5000/api/combos'),
                    articleApi.getAll()
                ]);
                setMovies(resMovies.data.data || resMovies.data);
                setCombos(resCombos.data.data || resCombos.data);
                setArticles(resArticles.data.data || resArticles.data);

                // 2. NẾU LÀ CHẾ ĐỘ EDIT (Có ID)
                if (id) {
                    const res = await axios.get(`http://localhost:5000/api/banners/${id}`);
                    console.log("Dữ liệu Banner nhận được:", res.data); // Debug để kiểm tra

                    if (res.data.success) {
                        const banner = res.data.data;

                        // Đổ dữ liệu cơ bản vào State
                        setTitle(banner.title || '');
                        setDescription(banner.description || '');

                        // Xử lý status: Database lưu 'active' hoặc 1, FE dùng boolean cho toggle
                        setStatus(banner.status === 'active' || banner.status === 1 || banner.status === '1');
                        /**
                         * Đổ dữ liệu mảng ảnh
                         * Backend hiện tại trả về 1 object banner duy nhất cho 1 ID.
                         * Ta biến object đó thành 1 hàng trong imageRows.
                         */
                        const mappedRow = {
                            id: banner.id,
                            file: null, // File vật lý không lấy lại được
                            // Sửa đường dẫn preview cho khớp với thư mục public ở Backend
                            preview: banner.image_url ? `http://localhost:5000${banner.image_url}` : null,
                            fileName: banner.image_url ? banner.image_url.split('/').pop() : 'Ảnh cũ',
                            linkType: banner.link_type || 'none',
                            targetId: banner.target_id || '',
                            externalUrl: banner.external_url || ''
                        };

                        setImageRows([mappedRow]);
                    }
                }
            } catch (err) {
                console.error("Lỗi khi lấy thông tin chi tiết:", err);
            }
        };
        fetchData();
    }, [id]);
    // 2. Hàm xử lý gửi dữ liệu (QUAN TRỌNG)
    const onFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('status', status ? 'active' : 'inactive');
            formData.append('description', description.trim());

            const dataConfig = imageRows.map(row => ({
                linkType: row.linkType,
                targetId: row.linkType === 'article' ? row.targetId : (row.targetId ? parseInt(row.targetId, 10) : null), externalUrl: row.externalUrl || ''
            }));
            formData.append('data', JSON.stringify(dataConfig));

            imageRows.forEach(row => {
                if (row.file) formData.append('images', row.file);
            });

            // DÙNG API ĐÃ KHAI BÁO
            if (id) {
                await bannerApi.updateBanner(id, formData);
            } else {
                // Truyền đúng 2 tham số như bannerApi.js yêu cầu ban đầu
                const mainData = { title, status: status ? 'active' : 'inactive', description };
                await bannerApi.addBanners(mainData, imageRows);
            }

            navigate('/admin/banners');
        } catch (err) {
            console.error(err);
            alert("Có lỗi xảy ra: " + (err.response?.data?.message || err.message));
        }
    };
    const addImageRow = () => {
        const newId = imageRows.length > 0 ? imageRows[imageRows.length - 1].id + 1 : 1;
        setImageRows([...imageRows, { id: newId, file: null, preview: null, fileName: 'Chưa chọn tệp', linkType: 'none', targetId: '', externalUrl: '' }]);
    };

    const handleRowChange = (id, field, value) => {
        setImageRows(imageRows.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    const handleFileChange = (id, e) => {
        const file = e.target.files[0];
        if (file) {
            setImageRows(imageRows.map(row =>
                row.id === id ? { ...row, file: file, fileName: file.name, preview: URL.createObjectURL(file) } : row
            ));
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.header}>
                <h2>THÊM SLIDE SHOW</h2>
            </div>

            {/* Thêm onSubmit vào đây */}
            <form className={styles.mainContainer} onSubmit={onFormSubmit}>
                <div className={styles.leftCol}>
                    <div className={styles.card}>
                        <div className={styles.inputBox}>
                            <label>Tiêu đề chiến dịch</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề..." required />
                        </div>

                        <div className={styles.imageSection}>
                            <div className={styles.imageHeader}>
                                <span>Danh sách banner & Liên kết</span>
                                <button type="button" className={styles.btnAddRow} onClick={addImageRow}>+ Thêm hàng</button>
                            </div>

                            <div className={styles.imageGrid}>
                                {imageRows.map((row) => (
                                    <div key={row.id} className={styles.imageRowCard}>
                                        <div className={styles.rowMain}>
                                            <div className={styles.previewBox}>
                                                {row.preview ? <img src={row.preview} alt="p" /> : <div className={styles.noImage}>Ảnh {row.id}</div>}
                                            </div>

                                            <div className={styles.controls}>
                                                <div className={styles.fileInputWrapper}>
                                                    <label htmlFor={`file-${row.id}`} className={styles.fileLabel}>Chọn ảnh</label>
                                                    <span className={styles.fileNameText}>{row.fileName}</span>
                                                    <input type="file" id={`file-${row.id}`} className={styles.hiddenInput} onChange={(e) => handleFileChange(row.id, e)} />
                                                </div>

                                                <div className={styles.linkConfig}>
                                                    <select
                                                        className={styles.selectType}
                                                        value={row.linkType}
                                                        onChange={(e) => handleRowChange(row.id, 'linkType', e.target.value)}
                                                    >
                                                        <option value="none">-- Không liên kết --</option>
                                                        <option value="movie">Liên kết Phim</option>
                                                        <option value="article">Liên kết Bài viết/Ưu đãi</option>
                                                        <option value="external">Đường dẫn ngoài (URL)</option>
                                                    </select>

                                                    {row.linkType === 'movie' && (
                                                        <select
                                                            className={styles.selectTarget}
                                                            value={row.targetId}
                                                            onChange={(e) => handleRowChange(row.id, 'targetId', e.target.value)}
                                                            required
                                                        >
                                                            <option value="">-- Chọn bộ phim --</option>
                                                            {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                                                        </select>
                                                    )}

                                                    {row.linkType === 'food' && (
                                                        <select
                                                            className={styles.selectTarget}
                                                            value={row.targetId}
                                                            onChange={(e) => handleRowChange(row.id, 'targetId', e.target.value)}
                                                            required
                                                        >
                                                            <option value="">-- Chọn Combo --</option>
                                                            {combos.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                        </select>
                                                    )}

                                                    {row.linkType === 'article' && (
                                                        <select
                                                            className={styles.selectTarget}
                                                            value={row.targetId}
                                                            onChange={(e) => handleRowChange(row.id, 'targetId', e.target.value)}
                                                            required
                                                        >
                                                            <option value="">-- Chọn bài viết/ưu đãi --</option>
                                                            {articles.map(art => (
                                                                <option key={art.id} value={art.slug}> {/* Đổi thành art.slug (chuỗi "heheheh") */}
                                                                    [{art.category || 'Tin tức'}] {art.title}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}

                                                    {row.linkType === 'url' && (
                                                        <input
                                                            type="text"
                                                            className={styles.inputUrl}
                                                            placeholder="Nhập link: https://..."
                                                            value={row.externalUrl}
                                                            onChange={(e) => handleRowChange(row.id, 'externalUrl', e.target.value)}
                                                            required
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Nhóm hai nút bấm lại để dễ căn chỉnh */}
                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className={styles.btnList}
                            onClick={() => {
                                // Chặn sự kiện nổi bọt
                                navigate('/admin/banners');
                            }}
                        >
                            Danh sách
                        </button>
                        <button type="submit" className={styles.btnSubmit}>
                            Xác nhận lưu
                        </button>
                    </div>
                </div>

                <div className={styles.rightCol}>
                    <div className={styles.card}>
                        <div className={styles.statusRow}>
                            <label>Hoạt động:</label>
                            <div className={`${styles.toggle} ${status ? styles.active : ''}`} onClick={() => setStatus(!status)}>
                                <div className={styles.toggleCircle}></div>
                            </div>
                        </div>
                        <div className={styles.inputBox}>
                            <label>Mô tả</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={8} />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BannerForm;