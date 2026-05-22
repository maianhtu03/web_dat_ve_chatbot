import React, { useState } from 'react';
import AdminComboTable from '../../../features/Combos/Admin/AdminComboTable';
import ComboForm from '../../../features/Combos/Admin/ComboForm';

const ComboList = () => {
    const [view, setView] = useState('table'); // 'table' hoặc 'form'
    const [selectedCombo, setSelectedCombo] = useState(null); // Lưu combo đang được chọn để sửa

    // Hàm xử lý khi nhấn nút Thêm mới
    const handleAddNew = () => {
        setSelectedCombo(null); // Xóa dữ liệu cũ nếu có
        setView('form');
    };

    // Hàm xử lý khi nhấn nút Sửa trong Table
    const handleEdit = (combo) => {
        setSelectedCombo(combo); // Lưu dữ liệu combo cần sửa
        setView('form');
    };

    // Hàm xử lý khi lưu thành công hoặc hủy
    const handleBackToTable = () => {
        setSelectedCombo(null);
        setView('table');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333' }}>
                QUẢN LÝ COMBO ĐỒ ĂN
            </h2>

            {view === 'table' ? (
                <AdminComboTable
                    onAddNew={handleAddNew}
                    onEdit={handleEdit}
                />
            ) : (
                <ComboForm
                    comboToEdit={selectedCombo} // Truyền dữ liệu vào Form
                    onCancel={handleBackToTable}
                    onSuccess={handleBackToTable}
                />
            )}
        </div>
    );
};

export default ComboList;