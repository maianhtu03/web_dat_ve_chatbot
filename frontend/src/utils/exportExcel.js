// File: src/utils/exportExcel.js
import * as XLSX from 'xlsx';

export const exportMultipleSheetsToExcel = (sheetsData, fileName) => {
    // 1. Tạo một workbook (file Excel) mới
    const workbook = XLSX.utils.book_new();

    // 2. Duyệt qua từng sheet được truyền vào
    sheetsData.forEach(({ sheetName, data }) => {
        if (!data || data.length === 0) return;

        // Chuyển đổi JSON sang định dạng Sheet
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Tự động căn chỉnh độ rộng cột cho đẹp
        const maxWidths = [];
        data.forEach(row => {
            Object.keys(row).forEach((key, i) => {
                const value = row[key] ? row[key].toString() : "";
                maxWidths[i] = Math.max(maxWidths[i] || 10, value.length + 2, key.length + 2);
            });
        });
        worksheet['!cols'] = maxWidths.map(w => ({ wch: w }));

        // Thêm sheet này vào workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    // 3. Tải file xuống máy
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};