const Room = require('../models/roomModel');
const db = require('../config/db');
const getAllRooms = async () => {
    return await Room.findAll();
};
const getCinemasByBranch = async (branchId) => {
    // Gọi đến hàm findCinemasByBranch bạn vừa thêm ở Model
    return await Room.findCinemasByBranch(branchId);
};

const createNewRoom = async (roomData) => {
    // Bạn có thể thêm logic kiểm tra tên phòng trùng lặp tại đây
    const processedData = {
        ...roomData,
        capacity: roomData.capacity || 0,
        template_id: roomData.template_id || null, // Chuyển undefined/rỗng thành null
        is_active: roomData.is_active ?? 1
    };
    return await Room.create(processedData);
};

const updateRoomInfo = async (id, roomData) => {
    const finalData = {};

    // 1. Chỉ lấy những trường được gửi lên (không undefined)
    Object.keys(roomData).forEach(key => {
        if (roomData[key] !== undefined) {
            finalData[key] = roomData[key];
        }
    });

    // 2. Xử lý giá trị rỗng từ Form FE gửi lên (chuỗi rỗng "" thường do Input reset)
    if (finalData.capacity === "") finalData.capacity = 0;
    if (finalData.template_id === "" || finalData.template_id === 0) finalData.template_id = null;

    return await Room.update(id, finalData);
};

const toggleRoomStatus = async (id, is_active) => {
    return await Room.updateStatus(id, is_active);
};

const removeRoom = async (id) => {
    return await Room.delete(id);
};

const getRoomById = async (id) => {
    // Gọi đến hàm findById trong Model (chúng ta sẽ tạo ở bước sau)
    return await Room.findById(id);
};
const getRoomsByCinema = async (cinemaId) => {
    // Lưu ý: Đảm bảo trong Model Room đã có hàm findByCinema hoặc query tương ứng
    return await Room.findByCinema(cinemaId);
};
// Sửa lại đoạn logic bóc tách trong roomService.js
const getEnumRoomTypes = async () => {
    const [rows] = await db.execute(`
        SELECT COLUMN_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'rooms' AND COLUMN_NAME = 'room_type'
    `);

    if (rows.length > 0) {
        const enumStr = rows[0].COLUMN_TYPE; // "enum('2D','3D','IMAX')"

        // Cách bóc tách an toàn hơn bằng replace và split
        const cleanStr = enumStr.replace(/^enum\(|\)$/g, ""); // " '2D','3D','IMAX' "
        const types = cleanStr.split(',').map(v => v.replace(/'/g, "").trim());

        console.log("Danh sách Type lấy được:", types); // Kiểm tra ở terminal xem có IMAX chưa
        return types;
    }
    return [];
};
module.exports = {
    getAllRooms,
    getCinemasByBranch,
    getRoomById,
    getRoomsByCinema,
    createNewRoom,
    updateRoomInfo,
    toggleRoomStatus,
    removeRoom,
    getEnumRoomTypes
};