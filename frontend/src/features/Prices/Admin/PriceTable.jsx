import React from 'react';
import styles from './PriceTable.module.css';

const PriceTable = ({ onCellChange, data = {} }) => {
    // 1. Cấu trúc ngày: Thứ 2 - Thứ 6, Thứ 7 - CN, Ngày Lễ
    const dayTypes = [
        { key: "T2-T6", label: "Thứ 2 - Thứ 6" },
        { key: "T7-CN", label: "Thứ 7 - Chủ Nhật" },
        { key: "Le", label: "Ngày Lễ" }
    ];

    // 2. Cấu trúc giờ: Sửa key thành các từ khóa đơn giản (Enum chuẩn)
    const timeSlots = [
        { key: "Sang", label: "Trước 18:00" },
        { key: "Toi", label: "18:00 - 22:00" },
        { key: "Dem", label: "Sau 22:00" }
    ];

    const handleFocus = (e) => e.target.select();

    const handleKeyDown = (e) => {
        if (["e", "E", "+", "-"].includes(e.key)) {
            e.preventDefault();
        }
    };

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead className={styles.thead}>
                    <tr>
                        <th className={styles.th}>Khung Giờ</th>
                        {dayTypes.map(day => (
                            <th key={day.key} className={styles.th}>{day.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {timeSlots.map(slot => (
                        <tr key={slot.key} className={styles.tr}>
                            <td className={styles.rowTitle}>{slot.label}</td>
                            {dayTypes.map(day => {
                                // Key này sẽ lưu xuống DB ví dụ: "T2-T6|Sang"
                                const cellKey = `${day.key}|${slot.key}`;
                                const cellValue = data[cellKey] ? parseInt(data[cellKey]) : "";

                                return (
                                    <td key={cellKey} className={styles.td}>
                                        <div className={styles.inputWrapper}>
                                            <input
                                                type="number"
                                                className={styles.cellInput}
                                                placeholder="0"
                                                min="0"
                                                step="1000"
                                                value={cellValue}
                                                onFocus={handleFocus}
                                                onKeyDown={handleKeyDown}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    // Chỉ cho phép nhập số dương hoặc rỗng
                                                    if (val === "" || Number(val) >= 0) {
                                                        onCellChange(day.key, slot.key, val);
                                                    }
                                                }}
                                            />
                                            <span className={styles.currency}>đ</span>
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PriceTable;