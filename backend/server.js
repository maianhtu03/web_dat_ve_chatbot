require('dotenv').config(); // LUÔN ĐỂ DÒNG NÀY TRÊN CÙNG để đọc file .env
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./src/routes/authRoutes.js');
const movieRoutes = require('./src/routes/movieRoutes.js');
const showtimeRoutes = require('./src/routes/showtimeRoutes.js');
const cinemaRoutes = require('./src/routes/cinemaRoutes.js');
const branchRoutes = require('./src/routes/branchRoutes.js');
const roomRoutes = require('./src/routes/roomRoutes.js');
const seatTemplateRoutes = require('./src/routes/seatTemplateRoutes.js');
const priceRoutes = require('./src/routes/priceRoutes.js');
const foodRouter = require('./src/routes/foodRouter');
const comboRoutes = require('./src/routes/comboRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes.js');
const bannerRoutes = require('./src/routes/bannerRoutes'); // Đảm bảo đường dẫn file là chính xác
const memberRoutes = require('./src/routes/memberRoutes');
const voucherRoutes = require('./src/routes/VoucherRoutes');
const articleRoutes = require('./src/routes/ArticleRoutes');
const statisticRoutes = require('./src/routes/statisticRoute');
const revenueRoutes = require('./src/routes/revenueRoute');
const ticketStatisticsRoutes = require('./src/routes/ticketStatisticsRouter'); // Thêm dòng này
const foodStatisticsRoutes = require('./src/routes/foodStatisticsRouter');
const movieStatisticsRoutes = require('./src/routes/movieStatisticsRouter');
const showtimeStatisticsRoutes = require('./src/routes/showtimeStatisticsRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const staffRoutes = require('./src/routes/staffRoutes.js');
const chatbotRoutes = require('./src/routes/chatbotRoutes'); // Thêm dòng này

// THÊM DÒNG NÀY
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', // Khớp với cổng Vite FE của bạn
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true
    }
});

// 4. Middleware truyền 'io' vào 'req' để dùng được trong Controller
app.use((req, res, next) => {
    req.io = io;
    next();
});
const seatLocks = {};

// Lắng nghe kết nối từ Client (để debug)
io.on('connection', (socket) => {
    console.log(`⚡ Một máy khách đã kết nối: ${socket.id}`);
    // --- SỰ KIỆN 1: KHI USER VÀO PHÒNG ĐẶT VÉ ---
    socket.on('join_booking', (showtimeId) => {
        socket.join(`room_${showtimeId}`);
        console.log(`User ${socket.id} gia nhập phòng suất chiếu: ${showtimeId}`);

        // Gửi danh sách các ghế đang bị người khác "giữ" cho người mới vào
        if (seatLocks[showtimeId]) {
            socket.emit('sync_locked_seats', seatLocks[showtimeId]);
        }
    });

    // --- SỰ KIỆN 2: KHI USER CLICK CHỌN GHẾ (START HOLDING) ---
    socket.on('lock_seat', ({ showtimeId, seatId, userId }) => {
        if (!seatLocks[showtimeId]) seatLocks[showtimeId] = {};

        // Kiểm tra xem ghế đã có ai giữ chưa
        if (seatLocks[showtimeId][seatId]) {
            return socket.emit('lock_error', 'Ghế này đang được người khác chọn!');
        }

        // Tạo khóa giữ ghế trong 10 phút
        const expireAt = Date.now() + 10 * 60 * 1000;
        seatLocks[showtimeId][seatId] = { socketId: socket.id, userId, expireAt };

        // Phát tín hiệu cho tất cả NHỮNG NGƯỜI KHÁC trong phòng
        socket.to(`room_${showtimeId}`).emit('seat_locked', { seatId, userId });

        // Gửi thông báo bắt đầu đếm ngược cho chính User đó
        socket.emit('start_countdown', { expireAt });
    });

    // --- SỰ KIỆN 3: KHI USER BỎ CHỌN GHẾ (UNLOCK) ---
    socket.on('unlock_seat', ({ showtimeId, seatId }) => {
        if (seatLocks[showtimeId] && seatLocks[showtimeId][seatId]) {
            delete seatLocks[showtimeId][seatId];
            io.to(`room_${showtimeId}`).emit('seat_unlocked', { seatId });
        }
    });
    socket.on('disconnect', () => {
        console.log('❌ Một máy khách đã ngắt kết nối');
        // Tìm và xóa tất cả ghế mà socket này đang giữ
        for (const showtimeId in seatLocks) {
            for (const seatId in seatLocks[showtimeId]) {
                if (seatLocks[showtimeId][seatId].socketId === socket.id) {
                    delete seatLocks[showtimeId][seatId];
                    io.to(`room_${showtimeId}`).emit('seat_unlocked', { seatId });
                }
            }
        }
    });
});
// 1. Cấu hình CORS chuyên nghiệp
const corsOptions = {
    origin: 'http://localhost:5173', // Địa chỉ Vite FE của bạn
    methods: 'GET,POST,PUT,DELETE,PATCH',
    credentials: true, // Cho phép gửi cookie/token nếu cần sau này
};
app.use(cors(corsOptions));

// 2. Middleware để đọc dữ liệu từ request
app.use(express.json()); // Đọc dữ liệu JSON (từ axios.post gửi lên)
app.use(express.urlencoded({ extended: true })); // Đọc dữ liệu từ form-urlencoded
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// 3. Định nghĩa các Route
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);      // Quản lý Phim
app.use('/api/showtimes', showtimeRoutes); // Quản lý Suất chiếu
app.use('/api/cinemas', cinemaRoutes);

app.use('/api/branches', branchRoutes);
app.use('/api/rooms', roomRoutes);   // Hệ thống Chi nhánh/Rạp/Phòng
app.use('/api/seat-templates', seatTemplateRoutes);
app.use('/api/prices', priceRoutes); // Khai báo tiền tố /api/prices
// 4. Route kiểm tra server (Optional - giúp bạn test nhanh trên trình duyệt)
app.use('/api/foods', foodRouter);
app.use('/api/combos', comboRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/memberships', memberRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/statistic', statisticRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/statistics/tickets', ticketStatisticsRoutes); // Thêm dòng này

// Thống kê Combo và Đồ ăn
app.use('/api/statistics/food', foodStatisticsRoutes);
// Thống kê Phim
app.use('/api/statistics/movie', movieStatisticsRoutes);
app.use('/api/statistics/showtimes', showtimeStatisticsRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.get('/', (req, res) => {
    res.send('Server MTU Cinemas đang chạy ổn định!');
});

// 5. Xử lý lỗi cho các route không tồn tại (404)
app.use((req, res) => {
    res.status(404).json({ message: "Đường dẫn không tồn tại trên server!" });
});

// 6. Lấy PORT từ file .env hoặc mặc định 5000
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Server (with Socket.io) running on port: ${PORT}`);
    console.log(`👉 API Phim: http://localhost:${PORT}/api/movies`);
    console.log(`👉 API Suất chiếu: http://localhost:${PORT}/api/showtimes/admin`);
    console.log(`👉 API Hệ thống rạp: http://localhost:${PORT}/api/cinemas/branches`);
    console.log(`-----------------------------------------`);
});