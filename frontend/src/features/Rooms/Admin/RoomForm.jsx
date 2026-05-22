import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './RoomForm.module.css';
import { ROOM_TYPES } from '../../../utils/constants';
const RoomForm = ({ initialData, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        branch_id: '',
        cinema_id: '',
        room_type: '2D',
        template_id: '',
        capacity: 149,
        status: 'Đã xuất bản'
    });
    const [branches, setBranches] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [seatTemplates, setSeatTemplates] = useState([]);


    useEffect(() => {
        // 1. Load danh sách chi nhánh
        axios.get('http://localhost:5000/api/branches/active')
            .then(res => setBranches(res.data))
            .catch(err => console.error("Lỗi load chi nhánh:", err));
        // 2. Load danh sách mẫu sơ đồ ghế
        axios.get('http://localhost:5000/api/seat-templates')
            .then(res => setSeatTemplates(res.data))
            .catch(err => console.error("Lỗi load mẫu sơ đồ:", err));

        // 2. Xử lý khi có dữ liệu truyền vào (Edit Mode)
        if (initialData) {
            const formattedData = {
                ...initialData,
                branch_id: String(initialData.branch_id || ''),
                cinema_id: String(initialData.cinema_id || ''),
                template_id: String(initialData.template_id || ''),
                // Đảm bảo capacity lấy từ data cũ nếu có
                capacity: initialData.capacity || 0
            };
            setFormData(formattedData);

            if (initialData.branch_id) {
                loadCinemas(initialData.branch_id);
            }
        }
    }, [initialData]);

    const loadCinemas = async (branchId) => {
        if (!branchId) {
            setCinemas([]);
            return;
        }
        try {
            // SỬA DÒNG NÀY: Đổi 'by-branch' thành 'cinemas-by-branch' (khớp với roomRoutes.js bạn vừa sửa)
            const res = await axios.get(`http://localhost:5000/api/rooms/cinemas-by-branch/${branchId}`);

            const formattedCinemas = res.data.map(c => ({
                ...c,
                id: String(c.id)
            }));
            setCinemas(formattedCinemas);
        } catch (error) {
            console.error("Lỗi load rạp chiếu:", error);
            setCinemas([]);
        }
    };

    const handleBranchChange = (e) => {
        const selectedBranchId = e.target.value;
        // Reset cinema_id về rỗng khi đổi chi nhánh để tránh lỗi chọn nhầm rạp cũ
        setFormData({ ...formData, branch_id: selectedBranchId, cinema_id: '' });
        loadCinemas(selectedBranchId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = initialData
                ? `http://localhost:5000/api/rooms/${initialData.id}`
                : 'http://localhost:5000/api/rooms/add';
            const method = initialData ? 'put' : 'post';

            // 1. Chỉ lấy các trường có trong bảng rooms (theo hình csdl của bạn)
            const finalPayload = {
                cinema_id: Number(formData.cinema_id),
                name: formData.name,
                room_type: formData.room_type,
                capacity: Number(formData.capacity) || 0, // Gửi giá trị đã tính ở trên
                status: formData.status,
                template_id: Number(formData.template_id),
                is_active: formData.is_active ?? 1
            };

            console.log("Dữ liệu gửi lên BE:", finalPayload);

            await axios[method](url, finalPayload);
            onSuccess();
        } catch (error) {
            console.error("Lỗi từ Server:", error.response?.data);
            alert("Lỗi: " + (error.response?.data?.message || "Kiểm tra lại Console"));
        }
    };
    const handleTemplateChange = (e) => {
        const selectedId = e.target.value;
        // Tìm đối tượng mẫu sơ đồ trong danh sách dựa trên ID người dùng vừa chọn
        const selectedTemplate = seatTemplates.find(t => String(t.id) === selectedId);

        if (selectedTemplate) {
            // Lấy con số capacity đã lưu ở Bước 1
            const actualCapacity = Number(selectedTemplate.capacity || 0);

            setFormData({
                ...formData,
                template_id: selectedId,
                // Áp dụng trực tiếp vào sức chứa của phòng
                capacity: actualCapacity
            });
        } else {
            setFormData({ ...formData, template_id: '', capacity: 0 });
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>{initialData ? 'Cập nhật phòng chiếu' : 'Thêm phòng chiếu'}</h3>
                    <button onClick={onClose} className={styles.closeIcon}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Tên phòng chiếu</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="VD: P101"
                            required
                        />
                    </div>
                    <div className={styles.grid}>
                        <div>
                            <label>Chi Nhánh</label>
                            {/* THÊM value={formData.branch_id} để Select luôn đồng bộ */}
                            <select
                                value={formData.branch_id} // Phải có dòng này
                                onChange={handleBranchChange}
                                required
                            >
                                <option value="">--- Chọn Chi Nhánh ---</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Rạp Chiếu</label>
                            {/* Select này sẽ chỉ hiện rạp sau khi loadCinemas chạy xong */}
                            <select
                                value={formData.cinema_id} // Phải có dòng này
                                onChange={e => setFormData({ ...formData, cinema_id: e.target.value })}
                                required
                                disabled={!formData.branch_id}
                            >
                                <option value="">--- Chọn Rạp Chiếu ---</option>
                                {cinemas.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={styles.grid}>
                        <div>
                            <label>Loại Phòng Chiếu</label>
                            <select
                                value={formData.room_type}
                                onChange={e => setFormData({ ...formData, room_type: e.target.value })}
                            >
                                {ROOM_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Mẫu Sơ Đồ Ghế</label>
                            <select
                                value={formData.template_id}
                                onChange={handleTemplateChange}
                                required
                            >
                                <option value="">--- Chọn Mẫu Sơ Đồ ---</option>
                                {seatTemplates.map(template => (
                                    <option key={template.id} value={template.id}>
                                        {template.name} ({template.capacity} ghế)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={styles.footer}>
                        <button type="button" onClick={onClose} className={styles.btnCancel}>Đóng</button>
                        <button type="submit" className={styles.btnSubmit}>
                            {initialData ? 'Cập nhật' : 'Thêm'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default RoomForm;