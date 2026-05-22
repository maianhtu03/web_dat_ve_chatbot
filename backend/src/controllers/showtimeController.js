const showtimeService = require('../services/showtimeService');
const Showtime = require('../models/showtimeModel');

const showtimeController = {
    getShowtimes: async (req, res) => {
        try {
            // Lấy các tham số lọc từ query string
            const { date, movieId, cinemaId, status } = req.query;

            // Truyền các tham số này vào Model
            const data = await Showtime.getAll(date, movieId, cinemaId, status);

            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    getShowtimeById: async (req, res) => {
        try {
            const { id } = req.params;
            // Gọi hàm getById từ Model (Chúng ta sẽ định nghĩa ở bước 2)
            const data = await Showtime.getById(id);

            if (!data) {
                return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
            }
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    // Thêm vào trong đối tượng showtimeController
    updateShowtime: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // 1. GỌI SERVICE: Để gộp dữ liệu cũ + tính lại end_time + check trùng lịch
            // Hàm này sẽ đảm bảo trả về một Object ĐẦY ĐỦ, không bị undefined
            const finalData = await showtimeService.handleUpdateShowtime(id, updateData);

            // 2. GỌI MODEL: Lúc này finalData đã "sạch" và đầy đủ
            const result = await Showtime.update(id, finalData);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Không tìm thấy suất chiếu để cập nhật" });
            }

            res.json({
                success: true,
                message: "Cập nhật suất chiếu thành công",
                data: finalData // Trả về để FE cập nhật UI nếu cần
            });

        } catch (error) {
            // Nếu Service ném ra lỗi "Trùng lịch" hoặc "Invalid date", nó sẽ rơi vào đây
            console.error("Lỗi update suất chiếu:", error.message);
            res.status(500).json({ message: error.message });
        }
    },
    addShowtime: async (req, res) => {
        try {
            // Nhận các trường từ form: 
            // isAuto (true/false), manualTimes (mảng giờ), duration (100), v.v.
            const result = await showtimeService.handleCreateShowtimes(req.body);
            // Nếu không có suất nào thành công và có danh sách trùng
            if (result.successCount === 0 && result.conflicts && result.conflicts.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Không thể thêm lịch vì khung giờ đã chọn bị trùng lịch!",
                    conflicts: result.conflicts
                });
            }
            res.status(201).json({
                success: true,
                message: `Thêm thành công ${result.successCount} suất chiếu!`,
                successCount: result.successCount,
                conflicts: result.conflicts
            });
        } catch (error) {
            // Nếu trùng lịch hoặc lỗi tính toán, Service sẽ ném (throw) lỗi về đây
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },
    // controllers/showtimeController.js

    addMultipleShowtimes: async (req, res) => {
        try {
            const result = await showtimeService.createMultipleShowtimes(req.body);
            // Trường hợp: Thất bại hoàn toàn (không lưu được suất nào)
            if (result.successCount === 0 && result.conflicts && result.conflicts.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Không thể thêm lịch chiếu vì tất cả các khung giờ đều bị trùng!",
                    successCount: 0,
                    failedCount: result.failed,
                    conflicts: result.conflicts
                });
            }
            res.status(201).json({
                success: true,
                message: `Đã xử lý xong. Thêm thành công ${result.successCount} suất chiếu!`,
                successCount: result.successCount,
                failedCount: result.failed,
                conflicts: result.conflicts // Đổi tên 'errors' thành 'conflicts' để khớp FE
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },
    getScheduleByRoom: async (req, res) => {
        try {
            const { roomId } = req.params;
            // Nhận thêm endDate từ query string gửi lên từ Frontend
            const { date, endDate } = req.query;

            // Truyền cả date và endDate vào Model để xử lý logic lấy dữ liệu
            const data = await Showtime.getByRoom(roomId, date, endDate);

            res.json(data);
        } catch (error) {
            console.error("Lỗi getScheduleByRoom:", error.message);
            res.status(500).json({ message: error.message });
        }
    },


    // Thêm hàm xóa
    // Trong file controllers/showtimeController.js
    deleteShowtime: async (req, res) => {
        try {
            const { id } = req.params;

            // Gọi hàm delete từ Model thay vì dùng trực tiếp db.execute
            const result = await Showtime.delete(id);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Không tìm thấy suất chiếu để xóa" });
            }

            res.json({ success: true, message: "Xóa suất chiếu thành công" });
        } catch (error) {
            // Nếu lỗi do ràng buộc khóa ngoại (ví dụ đã có người đặt vé), error.message sẽ thông báo rõ
            console.error("Lỗi xóa suất chiếu:", error);
            res.status(500).json({
                message: "Không thể xóa suất chiếu này (có thể đã có vé được đặt hoặc lỗi hệ thống)",
                detail: error.message
            });
        }
    },
    updateStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body; // Nhận trạng thái mới từ Frontend gửi lên

            // Gọi hàm updateStatus từ Model (Bạn sẽ cần định nghĩa hàm này ở showtimeModel)
            const result = await Showtime.updateStatus(id, status);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy suất chiếu để cập nhật"
                });
            }

            res.json({
                success: true,
                message: "Cập nhật trạng thái thành công",
                newStatus: status
            });
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi hệ thống khi cập nhật trạng thái",
                detail: error.message
            });
        }
    },
    getBookingData: async (req, res) => {
        try {
            const { id } = req.params;

            const showtime = await Showtime.getById(id);
            if (!showtime) {
                return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
            }

            const seats = await Showtime.getSeatStates(id, showtime.template_id);

            res.json({
                success: true,
                showtime: {
                    id: showtime.id,
                    // --- THÊM DÒNG DƯỚI ĐÂY ---
                    cinema_id: showtime.cinema_id,
                    // -------------------------
                    movie_title: showtime.movie_title,
                    poster: showtime.poster,
                    movie_rating: showtime.movie_rating,
                    movie_genres: showtime.genre,     // Thể loại phim
                    movie_duration: showtime.duration, // Thời lượng phim
                    movie_format: `${showtime.room_type || "2D"} ${showtime.format || ""}`.trim(),
                    room_name: showtime.room_name,
                    show_date: showtime.show_date,
                    start_time: showtime.start_time,
                    end_time: showtime.end_time,
                    // Đảm bảo tên biến khớp với FE (movie_format)
                    cinema_name: showtime.cinema_name,
                    branch_name: showtime.branch_name
                },
                seats: seats
            });
        } catch (error) {
            console.error("Lỗi lấy dữ liệu đặt vé:", error);
            res.status(500).json({
                message: "Không thể lấy sơ đồ ghế cho suất chiếu này",
                detail: error.message
            });
        }
    },
    // Thêm vào file controllers/showtimeController.js

    getCinemaSchedule: async (req, res) => {
        try {
            const { cinemaId } = req.params;
            const { date } = req.query; // Ví dụ: 2026-04-24

            if (!cinemaId || !date) {
                return res.status(400).json({ message: "Thiếu Cinema ID hoặc Ngày" });
            }

            const data = await Showtime.getScheduleByCinema(cinemaId, date);
            res.json(data);
        } catch (error) {
            console.error("Lỗi getCinemaSchedule:", error.message);
            res.status(500).json({ message: error.message });
        }
    }

};


module.exports = showtimeController;