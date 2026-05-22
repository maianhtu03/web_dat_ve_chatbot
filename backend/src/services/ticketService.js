const Ticket = require('../models/ticketModel');

const getAllTickets = async (filters) => {
    return await Ticket.findAll(filters);
};

const getTicketDetail = async (id) => {
    const ticket = await Ticket.findById(id);
    if (!ticket) return null;

    const combos = await Ticket.findCombosByTicketId(ticket.id);

    // Gộp dữ liệu vé và combo trả về 1 cục cho Controller
    return {
        ...ticket,
        combos: combos
    };
};

// --- PHẦN BỔ SUNG THÊM ---
const checkInTicket = async (id) => {
    const ticket = await Ticket.findById(id);
    if (!ticket) throw new Error("Không tìm thấy vé!");

    if (ticket.is_printed === 1) {
        throw new Error("Vé này đã được in và xuất tại quầy trước đó!");
    }

    if (ticket.payment_status?.toLowerCase() !== 'paid' && ticket.payment_status !== 'đã thanh toán') {
        throw new Error("Vé chưa hoàn tất thanh toán, không thể xuất vé giấy!");
    }

    // ĐỔI DÒNG NÀY: Gọi hàm updatePrintedStatus thay vì updateStatus
    return await Ticket.updatePrintedStatus(ticket.id);
};
module.exports = {
    getAllTickets,
    getTicketDetail,
    checkInTicket

};