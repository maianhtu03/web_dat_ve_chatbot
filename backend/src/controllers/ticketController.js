const ticketService = require('../services/ticketService');
const Ticket = require('../models/ticketModel');
const getTickets = async (req, res) => {
    try {
        const filters = {
            branch: req.query.branch || '',
            cinema: req.query.cinema || '',
            date: req.query.date || '',
            status: req.query.status || 'all',
            movie: req.query.movie || '',
            search: req.query.search || ''
        };
        const data = await ticketService.getAllTickets(filters);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách vé", error: error.message });
    }
};

const getTicketById = async (req, res) => {
    try {
        const data = await ticketService.getTicketDetail(req.params.id);
        if (!data) {
            return res.status(404).json({ message: "Không tìm thấy thông tin vé" });
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy chi tiết vé", error: error.message });
    }
};
const getFilterOptions = async (req, res) => {
    try {
        // Bây giờ Ticket đã được định nghĩa, nó sẽ chạy được hàm này
        const options = await Ticket.getFilterOptions();
        res.status(200).json({
            success: true,
            data: options
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách tùy chọn lọc", error: error.message });
    }
};

const checkInTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;

        // Gọi sang service để xử lý nghiệp vụ soát vé
        // (Hàm checkInTicket này bạn đã thêm ở file ticketService.js)
        const result = await ticketService.checkInTicket(ticketId);

        if (result) {
            res.status(200).json({
                success: true,
                message: "Xác nhận soát vé thành công!"
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Không thể cập nhật trạng thái vé."
            });
        }
    } catch (error) {
        // Trả về lỗi từ Service (ví dụ: vé đã dùng rồi, vé chưa thanh toán...)
        res.status(400).json({
            success: false,
            message: error.message || "Lỗi khi soát vé"
        });
    }
};
module.exports = {
    getTickets,
    getTicketById,
    getFilterOptions,
    checkInTicket
};