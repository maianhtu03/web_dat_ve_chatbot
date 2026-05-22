const db = require('../config/db');

const SeatTemplate = {
    // 1. Lấy toàn bộ danh sách mẫu sơ đồ
    findAll: async () => {
        const sql = "SELECT * FROM seat_templates ORDER BY id DESC";
        const [rows] = await db.execute(sql);
        return rows;
    },

    // 2. Tìm một mẫu theo ID
    findById: async (id) => {
        const [rows] = await db.execute("SELECT * FROM seat_templates WHERE id = ?", [id]);
        return rows[0];
    },

    // 3. Tạo mẫu mới 
    create: async (data) => {
        const { name, matrix_size, normal_rows, vip_rows, couple_rows, description, capacity } = data;

        // Tách chuỗi "13x13" thành số để lưu vào cột riêng (tiện cho việc render matrix ở FE sau này)
        const [rows_count, cols_count] = matrix_size.split('x').map(Number);

        const sql = `
            INSERT INTO seat_templates 
            (name, matrix_size, rows_count, cols_count, normal_rows, vip_rows, couple_rows, description, is_active,capacity) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(sql, [
            name,
            matrix_size,
            rows_count,
            cols_count,
            Number(normal_rows) || 0,
            Number(vip_rows) || 0,
            Number(couple_rows) || 0,
            description || '',
            1, // Mặc định là active khi mới tạo,
            Number(capacity) || 0
        ]);

        return {
            insertId: result.insertId,
            rows_count,
            cols_count
        };
    },

    // 4. LƯU HÀNG LOẠT GHẾ (Bulk Insert)
    // seatsData phải là mảng các mảng: [[template_id, row_index, col_index, row_label, seat_number, type, status], ...]
    createSeatsBatch: async (seatsData) => {
        // Nếu Service gửi 7 trường, SQL cũng phải nhận đúng 7 trường theo thứ tự
        const sql = `
            INSERT INTO seats 
            (template_id, row_index, col_index, row_label, seat_number, type, status) 
            VALUES ?
        `;
        // Cột is_broken sẽ tự động nhận giá trị mặc định là 0 từ DB
        const [result] = await db.query(sql, [seatsData]);
        return result.affectedRows;
    },
    // Thêm vào trong đối tượng SeatTemplate
    syncCapacity: async (templateId) => {
        // 1. Lấy tất cả ghế đang active của template này
        const [seats] = await db.execute(
            "SELECT id, row_label, type FROM seats WHERE template_id = ? AND status = 'active' ORDER BY row_label, col_index",
            [templateId]
        );

        let actualCount = 0;
        const rows = {};

        // Nhóm theo hàng
        seats.forEach(s => {
            if (!rows[s.row_label]) rows[s.row_label] = [];
            rows[s.row_label].push(s);
        });

        // Chạy logic giống hệt Frontend để đếm
        Object.values(rows).forEach(rowSeats => {
            for (let i = 0; i < rowSeats.length; i++) {
                const current = rowSeats[i];
                const next = rowSeats[i + 1];

                if (current.type === 'couple' && next && next.type === 'couple') {
                    actualCount += 2; // Cặp đôi hợp lệ
                    i++; // Bỏ qua ghế tiếp theo vì đã đếm theo cặp
                } else if (current.type !== 'couple') {
                    actualCount += 1; // Ghế đơn
                } else {
                    // Ghế đôi bị lẻ -> Không cộng vào actualCount (giống logic FE)
                    console.warn(`Backend: Bỏ qua ghế đôi lẻ tại hàng ${current.row_label}`);
                }
            }
        });

        // 2. Cập nhật vào bảng seat_templates
        await db.execute("UPDATE seat_templates SET capacity = ? WHERE id = ?", [actualCount, templateId]);

        return actualCount;
    },
    // 5. Cập nhật thông tin cơ bản của mẫu
    updateInfo: async (id, data) => {
        // THÊM: Lấy status từ object data truyền vào
        const { name, matrix_size, description, normal_rows, vip_rows, couple_rows, status, capacity } = data;

        let rows_count = 0;
        let cols_count = 0;
        if (matrix_size && typeof matrix_size === 'string') {
            const parts = matrix_size.split('x');
            if (parts.length === 2) {
                rows_count = Number(parts[0]);
                cols_count = Number(parts[1]);
            }
        }

        const sql = `
        UPDATE seat_templates 
        SET name = ?, 
            matrix_size = ?, 
            rows_count = ?, 
            cols_count = ?, 
            description = ?, 
            normal_rows = ?, 
            vip_rows = ?, 
            couple_rows = ?,
            status = ?,  -- THÊM DÒNG NÀY
            capacity = ?
        WHERE id = ?
    `;

        const [result] = await db.execute(sql, [
            name || null,
            matrix_size || null,
            rows_count || 0,
            cols_count || 0,
            description || '',
            Number(normal_rows) || 0,
            Number(vip_rows) || 0,
            Number(couple_rows) || 0,
            status || 'draft', // THÊM DÒNG NÀY (Mặc định là draft nếu không có)
            Number(capacity) || 0,
            id
        ]);
        return result.affectedRows;
    },

    // 6. Cập nhật trạng thái hoạt động (Nút gạt On/Off)
    updateStatus: async (id, is_active) => {
        const sql = "UPDATE seat_templates SET is_active = ? WHERE id = ?";
        const [result] = await db.execute(sql, [is_active ? 1 : 0, id]);
        return result.affectedRows;
    },

    // 7. Cập nhật chi tiết một chiếc ghế (Dùng trong Editor)
    updateSeat: async (seatId, data) => {
        const { type, status } = data;

        // Nếu có truyền type thì update cả 2, nếu không chỉ update status
        let sql, params;
        if (type) {
            sql = "UPDATE seats SET type = ?, status = ? WHERE id = ?";
            params = [type, status, seatId];
        } else {
            sql = "UPDATE seats SET status = ? WHERE id = ?";
            params = [status, seatId];
        }

        const [result] = await db.execute(sql, params);
        // 2. TÌM TEMPLATE_ID VÀ ĐỒNG BỘ CAPACITY
        // Lấy template_id của ghế vừa sửa
        const [seatInfo] = await db.execute("SELECT template_id FROM seats WHERE id = ?", [seatId]);
        if (seatInfo[0]) {
            await SeatTemplate.syncCapacity(seatInfo[0].template_id); // Dùng hàm dùng chung
        }
        return result.affectedRows;

    },
    updateRowStatus: async (templateId, rowLabel, status) => {
        const sql = "UPDATE seats SET status = ? WHERE template_id = ? AND row_label = ?";
        const [result] = await db.execute(sql, [status, templateId, rowLabel]);
        // Đồng bộ lại capacity sau khi ẩn/hiện nguyên hàng
        await SeatTemplate.syncCapacity(templateId);
        return result.affectedRows;
    },

    // 8. Lấy danh sách ghế để hiển thị sơ đồ
    getSeatsByTemplateId: async (templateId) => {
        try {
            // Kiểm tra templateId trước khi chạy
            if (!templateId) {
                throw new Error("Template ID is required");
            }

            const sql = "SELECT * FROM seats WHERE template_id = ? ORDER BY row_index ASC, col_index ASC";
            const [rows] = await db.execute(sql, [templateId]);
            return rows;
        } catch (error) {
            // Dòng này cực kỳ quan trọng để debug lỗi 500
            console.error("LỖI SQL TẠI MODEL (getSeatsByTemplateId):", error.message);
            throw error; // Quăng lỗi ra để Controller bắt được và hiện message lên trình duyệt
        }
    },
    // 10. Reset toàn bộ trạng thái hỏng (is_broken) của một template về 0
    resetBrokenStatusByTemplate: async (templateId) => {
        // Nếu templateId bị null/undefined, ném lỗi rõ ràng thay vì để SQL crash
        if (!templateId) throw new Error("Model: templateId is required for reset");

        const sql = "UPDATE seats SET is_broken = 0 WHERE template_id = ?";
        const [result] = await db.execute(sql, [templateId]);
        return result.affectedRows;
    },

    // 11. Cập nhật trạng thái hỏng (is_broken = 1) cho danh sách ID ghế cụ thể
    // 11. Cập nhật trạng thái hỏng (is_broken = 1) cho danh sách ID ghế cụ thể
    setBrokenStatus: async (seatIds) => {
        if (!seatIds || seatIds.length === 0) return 0;

        const placeholders = seatIds.map(() => '?').join(',');
        const sql = `UPDATE seats SET is_broken = 1 WHERE id IN (${placeholders})`;

        // Dùng db.query thay vì execute để đảm bảo mảng tham số được map chính xác vào các dấu ?
        const [result] = await db.query(sql, seatIds);
        return result.affectedRows;
    },

    // 9. Xóa mẫu sơ đồ
    delete: async (id) => {
        // Lưu ý: Đảm bảo bảng seats có FK template_id ON DELETE CASCADE
        const [result] = await db.execute("DELETE FROM seat_templates WHERE id = ?", [id]);
        return result.affectedRows;
    }
};



module.exports = SeatTemplate;