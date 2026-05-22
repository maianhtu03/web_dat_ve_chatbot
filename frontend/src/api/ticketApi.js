import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tickets';

const ticketApi = {
    // Lấy danh sách vé
    getAllTickets: (params) => axios.get(`${API_URL}/admin/tickets`, { params }),

    // Lấy chi tiết vé (Dùng đúng ID truyền từ URL)
    getTicketById: (id) => axios.get(`${API_URL}/admin/tickets/${id}`),
    checkInTicket: (id) => axios.patch(`${API_URL}/admin/tickets/${id}/checkin`),

    getFilterOptions: () => axios.get(`${API_URL}/options`),
};

export default ticketApi;