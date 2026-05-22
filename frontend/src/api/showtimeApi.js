const API_URL = 'http://localhost:5000/api/showtimes'; // Thay đổi port cho đúng với Server của bạn

const showtimeApi = {
    // 1. Lấy danh sách tất cả suất chiếu (để hiển thị ở bảng ShowtimeManager)
    getAll: async (params = {}) => {
        // Làm sạch params để bộ lọc hoạt động chuẩn
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
        );

        const queryString = new URLSearchParams(cleanParams).toString();
        const url = queryString ? `${API_URL}?${queryString}` : API_URL;

        const response = await fetch(url);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể lấy danh sách suất chiếu');
        }
        return response.json();
    },
    getById: async (id) => {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể lấy thông tin suất chiếu');
        }
        return response.json();
    },

    // 2. THÊM MỚI: Hàm Update để lưu dữ liệu sau khi chỉnh sửa
    update: async (id, data) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT', // Hoặc 'PATCH' tùy theo thiết kế của Backend
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Lỗi khi cập nhật suất chiếu');
        }
        return result;
    },

    // 2. Thêm mới suất chiếu (Dùng chung cho cả 2 Tab)
    // data sẽ bao gồm trường { type: 'single' } hoặc { type: 'multiple' }
    create: async (data) => {
        const response = await fetch(`${API_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Nếu bạn có dùng Token Admin thì thêm vào đây:
                // 'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            // QUAN TRỌNG: Gắn thêm response data vào error object
            const error = new Error(result.message || 'Lỗi khi tạo suất chiếu');
            error.response = { data: result };
            throw error;
        }
        return { data: result };
    },

    // 3. Xóa suất chiếu
    delete: async (id) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể xóa suất chiếu');
        }
        return response.json();
    },
    updateStatus: async (id, status) => {
        const response = await fetch(`${API_URL}/${id}/status`, {
            method: 'PATCH', // Hoặc 'PUT' tùy theo Backend
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Lỗi khi cập nhật trạng thái');
        }
        return result;
    },
    // 3. THÊM MỚI: Thêm nhiều ngày (Khớp route POST /multiple)
    createMultiple: async (data) => {
        const response = await fetch(`${API_URL}/multiple`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) {
            // Tương tự: Phải gắn data (chứa conflicts) vào đây
            const error = new Error(result.message || 'Lỗi khi tạo lịch chiếu hàng loạt');
            error.response = { data: result };
            throw error;
        }
        return { data: result };
    },

    // 4. Lấy lịch của một phòng cụ thể (Để hiển thị cột bên phải khi Admin chọn phòng)
    // Giúp Admin biết phòng đó đã có những suất nào để tránh chọn trùng giờ
    getScheduleByRoom: async (roomId, date, endDate = null) => {
        // Tạo URL cơ bản
        let url = `${API_URL}/room/${roomId}?date=${date}`;

        // Nếu có endDate (tab nhiều ngày), nối thêm vào query string
        if (endDate) {
            url += `&endDate=${endDate}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Không thể lấy lịch phòng');
        }
        return response.json();
    },
    // Tìm hàm này ở cuối file showtimeApi.js
    getBookingData: async (id) => {
        // ĐỔI TỪ: ${API_URL}/${id}/booking
        // THÀNH: ${API_URL}/booking/${id}
        const response = await fetch(`${API_URL}/booking/${id}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể lấy sơ đồ ghế');
        }
        return response.json();
    },
    getCinemaSchedule: async (cinemaId, date) => {
        if (!cinemaId || !date) {
            throw new Error('Thiếu Cinema ID hoặc Ngày để lấy lịch chiếu');
        }

        const url = `${API_URL}/cinema/${cinemaId}/schedule?date=${date}`;

        const response = await fetch(url);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Không thể lấy lịch chiếu của rạp');
        }

        return result; // Trả về mảng các phim, mỗi phim chứa formats và showtimes
    }

};

export default showtimeApi;