const roomService = require('../services/roomService');

const getRooms = async (req, res) => {
    try {
        const data = await roomService.getAllRooms();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addRoom = async (req, res) => {
    try {
        // Bóc tách dữ liệu và gán giá trị mặc định nếu cần để tránh undefined
        const {
            name,
            cinema_id,
            room_type,
            capacity,
            template_id,
            status
        } = req.body;

        const roomData = {
            name,
            cinema_id,
            room_type,
            capacity: capacity || 0, // Tránh undefined
            template_id: template_id || null, // Tránh undefined
            status: status || 'Đã xuất bản'
        };

        await roomService.createNewRoom(roomData);
        res.status(201).json({ message: "Thêm phòng chiếu thành công" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateRoom = async (req, res) => {
    try {
        const id = req.params.id;
        const dataFromFE = req.body;

        // Tạo một object rỗng để chứa dữ liệu sạch
        const updateData = {};

        // Chỉ thêm vào object những trường có giá trị (không undefined)
        const fields = ['name', 'cinema_id', 'room_type', 'capacity', 'template_id', 'status', 'is_active'];

        fields.forEach(field => {
            if (dataFromFE[field] !== undefined) {
                updateData[field] = dataFromFE[field];
            }
        });

        // Nếu không có dữ liệu gì để cập nhật thì báo lỗi nhẹ
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
        }

        await roomService.updateRoomInfo(id, updateData);
        res.status(200).json({ message: "Cập nhật phòng chiếu thành công" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { is_active } = req.body;
        await roomService.toggleRoomStatus(req.params.id, is_active);
        res.status(200).json({ message: "Cập nhật trạng thái thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteRoom = async (req, res) => {
    try {
        await roomService.removeRoom(req.params.id);
        res.status(200).json({ message: "Xóa phòng chiếu thành công" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const getCinemasByBranch = async (req, res) => {
    try {
        const { branchId } = req.params;
        const data = await roomService.getCinemasByBranch(branchId);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        // Gọi service để lấy thông tin chi tiết phòng
        const data = await roomService.getRoomById(id);

        if (!data) {
            return res.status(404).json({ message: "Không tìm thấy phòng chiếu" });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getRoomsByCinema = async (req, res) => {
    try {
        const { cinemaId } = req.params;
        // Gọi service để lấy danh sách phòng thuộc rạp này
        const data = await roomService.getRoomsByCinema(cinemaId);

        // Trả về dữ liệu bọc trong object { data: [...] } để khớp với cách FE nhận res.data
        res.status(200).json({ data: data });
    } catch (error) {
        console.error("Lỗi tại getRoomsByCinema Controller:", error);
        res.status(500).json({ message: error.message });
    }
};
const getRoomTypes = async (req, res) => {
    try {
        // Gọi đến service để lấy danh sách các loại định dạng từ ENUM của DB
        const data = await roomService.getEnumRoomTypes();
        res.status(200).json(data);
    } catch (error) {
        console.error("Lỗi tại getRoomTypes Controller:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getRooms, addRoom, updateRoom, updateStatus, deleteRoom, getCinemasByBranch, getRoomById, getRoomsByCinema, getRoomTypes };