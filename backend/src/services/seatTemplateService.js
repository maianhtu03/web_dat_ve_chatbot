const SeatTemplate = require('../models/seatTemplateModel');

const getAllTemplates = async () => {
    return await SeatTemplate.findAll();
};


const calculateActualCapacity = (nRows, vRows, cRows, colsCount) => {
    const normalAndVipSeats = (nRows + vRows) * colsCount;

    let coupleSeats;
    // Nếu là ghế đôi và số cột lẻ, ghế cuối cùng của mỗi hàng sẽ bị bỏ qua (vì lẻ)
    if (colsCount % 2 !== 0) {
        coupleSeats = cRows * (colsCount - 1);
    } else {
        coupleSeats = cRows * colsCount;
    }

    return normalAndVipSeats + coupleSeats;
};

const createNewTemplate = async (templateData) => {
    // 1. Tách chuỗi matrix_size (VD: "12x14")
    const [rowsLimit, colsCount] = templateData.matrix_size.split('x').map(Number);

    const nRows = Number(templateData.normal_rows || 0);
    const vRows = Number(templateData.vip_rows || 0);
    const cRows = Number(templateData.couple_rows || 0);
    const totalInputRows = nRows + vRows + cRows;

    // 2. Kiểm tra logic chặt chẽ (Phòng trường hợp Admin nhập sai số lượng hàng phân loại)
    if (totalInputRows !== rowsLimit) {
        throw new Error(`Tổng số hàng phân loại (${totalInputRows}) phải bằng chính xác tổng số hàng ma trận (${rowsLimit})`);
    }

    const totalCapacity = calculateActualCapacity(nRows, vRows, cRows, colsCount);    // 3. Gọi Model để tạo bản ghi trong bảng seat_templates
    const result = await SeatTemplate.create({
        ...templateData,
        capacity: totalCapacity // Thêm con số này để Model lưu vào DB
    });
    const templateId = result.insertId;

    // 4. THUẬT TOÁN TỰ ĐỘNG SINH GHẾ
    const seatsToInsert = [];

    // Hàm chuyển index thành nhãn hàng (0 -> A, 1 -> B, ..., 26 -> AA)
    const getRowLabel = (index) => {
        let label = "";
        while (index >= 0) {
            label = String.fromCharCode((index % 26) + 65) + label;
            index = Math.floor(index / 26) - 1;
        }
        return label;
    };

    let currentRowIndex = 0;

    const generateRows = (count, type) => {
        for (let i = 0; i < count; i++) {
            const label = getRowLabel(currentRowIndex);
            let effectiveCols = colsCount;
            if (type === 'couple' && colsCount % 2 !== 0) {
                effectiveCols = colsCount - 1; // Bỏ cột cuối cùng
            }
            for (let c = 0; c < colsCount; c++) {
                seatsToInsert.push([
                    templateId,
                    currentRowIndex + 1, // row_index (bắt đầu từ 1 cho DB dễ nhìn)
                    c + 1,                // col_index (bắt đầu từ 1)
                    label,                // row_label (A, B, C...)
                    c + 1,                // seat_number (Số thứ tự trong hàng)
                    type,
                    'active'
                ]);
            }
            currentRowIndex++;
        }
    };

    // Sinh ghế theo thứ tự: Thường -> VIP -> Đôi (Bạn có thể đảo thứ tự tùy ý)
    generateRows(nRows, 'normal');
    generateRows(vRows, 'vip');
    generateRows(cRows, 'couple');

    // 5. Lưu hàng loạt vào DB
    if (seatsToInsert.length > 0) {
        await SeatTemplate.createSeatsBatch(seatsToInsert);
    }

    return templateId;
};

const editTemplateInfo = async (id, data) => {
    const oldTemplate = await SeatTemplate.findById(id);
    if (!oldTemplate) throw new Error("Mẫu không tồn tại");

    const matrix_size = data.matrix_size || oldTemplate.matrix_size;
    const nRows = data.normal_rows !== undefined ? Number(data.normal_rows) : oldTemplate.normal_rows;
    const vRows = data.vip_rows !== undefined ? Number(data.vip_rows) : oldTemplate.vip_rows;
    const cRows = data.couple_rows !== undefined ? Number(data.couple_rows) : oldTemplate.couple_rows;

    // ĐẢM BẢO TRƯỜNG STATUS ĐƯỢC CẬP NHẬT
    // Nếu data.status không có (FE không gửi), hãy giữ nguyên status cũ
    const status = data.status || oldTemplate.status;

    const [rowsLimit, colsCount] = matrix_size.split('x').map(Number);
    const newCapacity = calculateActualCapacity(nRows, vRows, cRows, colsCount);

    await SeatTemplate.updateInfo(id, {
        ...data,
        matrix_size,
        normal_rows: nRows,
        vip_rows: vRows,
        couple_rows: cRows,
        status: status
    });

    // 3. Kiểm tra: Chỉ khi nào Admin thực sự thay đổi Matrix hoặc Hàng ghế thì mới sinh lại ghế
    const isMatrixChanged = data.matrix_size && data.matrix_size !== oldTemplate.matrix_size;
    const isRowsChanged =
        (data.normal_rows !== undefined && Number(data.normal_rows) !== oldTemplate.normal_rows) ||
        (data.vip_rows !== undefined && Number(data.vip_rows) !== oldTemplate.vip_rows) ||
        (data.couple_rows !== undefined && Number(data.couple_rows) !== oldTemplate.couple_rows);

    if (isMatrixChanged || isRowsChanged) {
        const db = require('../config/db');
        await db.execute("DELETE FROM seats WHERE template_id = ?", [id]);

        // Sử dụng biến matrix_size đã được bảo vệ ở trên
        const [rowsLimit, colsCount] = matrix_size.split('x').map(Number);

        if (nRows + vRows + cRows !== rowsLimit) {
            throw new Error("Tổng số hàng phân loại không khớp với ma trận mới");
        }

        const seatsToInsert = [];
        const getRowLabel = (index) => {
            let label = "";
            while (index >= 0) {
                label = String.fromCharCode((index % 26) + 65) + label;
                index = Math.floor(index / 26) - 1;
            }
            return label;
        };

        let currentRowIndex = 0;
        const generateRows = (count, type) => {
            for (let i = 0; i < count; i++) {
                const label = getRowLabel(currentRowIndex);
                let effectiveCols = colsCount;
                if (type === 'couple' && colsCount % 2 !== 0) {
                    effectiveCols = colsCount - 1;
                }
                for (let c = 0; c < colsCount; c++) {
                    seatsToInsert.push([id, currentRowIndex + 1, c + 1, label, c + 1, type, 'active']);
                }
                currentRowIndex++;
            }
        };

        generateRows(nRows, 'normal');
        generateRows(vRows, 'vip');
        generateRows(cRows, 'couple');

        if (seatsToInsert.length > 0) {
            await SeatTemplate.createSeatsBatch(seatsToInsert);
        }
    }
};

const updateSeatDetail = async (seatId, data) => {
    return await SeatTemplate.updateSeat(seatId, data);
};

const removeTemplate = async (id) => {
    return await SeatTemplate.delete(id);
};

const toggleStatus = async (id, is_active) => {
    return await SeatTemplate.updateStatus(id, is_active);
};

const getTemplateById = async (id) => {
    const template = await SeatTemplate.findById(id);
    if (!template) return null;

    const seats = await SeatTemplate.getSeatsByTemplateId(id);
    return { ...template, seats };
};
const updateRowStatus = async (templateId, rowLabel, status) => {
    return await SeatTemplate.updateRowStatus(templateId, rowLabel, status);
};
const getSeatsByTemplateId = async (id) => {
    // Gọi trực tiếp từ Model mà bạn đã viết rất chuẩn ở bước trước
    return await SeatTemplate.getSeatsByTemplateId(id);
};
// Thêm hàm xử lý cập nhật trạng thái ghế hỏng hàng loạt
const updateBrokenStatus = async (templateId, brokenSeatIds) => {
    // 1. Reset toàn bộ ghế của template này về is_broken = 0 (Bình thường)
    await SeatTemplate.resetBrokenStatusByTemplate(templateId);

    // 2. Nếu có danh sách ID ghế hỏng, cập nhật is_broken = 1 cho chúng
    if (brokenSeatIds && brokenSeatIds.length > 0) {
        await SeatTemplate.setBrokenStatus(brokenSeatIds);
    }

    return true;
};
module.exports = {
    getAllTemplates,
    createNewTemplate,
    removeTemplate,
    toggleStatus,
    getTemplateById,
    editTemplateInfo,
    updateSeatDetail,
    updateRowStatus,
    getSeatsByTemplateId,
    updateBrokenStatus
};