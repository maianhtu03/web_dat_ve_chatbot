import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SeatTemplateTable from '../../../features/SeatTemplates/Admin/SeatTemplateTable';
import SeatTemplateForm from '../../../features/SeatTemplates/Admin/SeatTemplateForm';
import styles from './SeatTemplateList.module.css';
import { createTemplate, updateTemplateInfo, updateTemplateStatus, deleteTemplate } from '../../../api/seatTemplateApi';

const SeatTemplateList = () => {
    const [templates, setTemplates] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    // Sử dụng useCallback để đóng gói hàm fetch. 
    // Điều này giúp hàm fetchTemplates bền vững qua các lần render.
    const fetchTemplates = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/seat-templates');
            setTemplates(res.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách mẫu:", error);
        }
    }, []);

    // useEffect gọi hàm thông qua dependency là [fetchTemplates]
    // Đây là cách fix lỗi chuẩn nhất theo tài liệu React mới.
    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleToggleStatus = async (id, is_active) => {
        try {
            // Gửi lệnh PATCH
            await axios.patch(`http://localhost:5000/api/seat-templates/${id}/status`, { is_active });

            // QUAN TRỌNG: Phải có dòng này để load lại bảng
            await fetchTemplates();
        } catch {
            alert("Lỗi khi cập nhật trạng thái");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa mẫu này?")) {
            try {
                await axios.delete(`http://localhost:5000/api/seat-templates/${id}`);
                fetchTemplates();
            } catch {
                alert("Lỗi khi xóa mẫu");
            }
        }
    };

    const handleSubmit = async (data) => {
        try {
            if (editingTemplate) {
                // Dùng hàm từ file API
                await updateTemplateInfo(editingTemplate.id, data);
            } else {
                // Dùng hàm từ file API
                await createTemplate(data);
            }
            setShowModal(false);
            fetchTemplates();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi lưu dữ liệu");
        }
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setShowModal(true);
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>DANH SÁCH MẪU SƠ ĐỒ GHẾ</h2>
                <button
                    className={styles.btnAdd}
                    onClick={() => { setEditingTemplate(null); setShowModal(true); }}
                >
                    + Tạo Mẫu Sơ Đồ Ghế
                </button>
            </div>

            {/* Bảng hiển thị danh sách */}
            <SeatTemplateTable
                templates={templates}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
            />

            {/* Modal Form */}
            {showModal && (
                <SeatTemplateForm
                    initialData={editingTemplate}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
};

export default SeatTemplateList;