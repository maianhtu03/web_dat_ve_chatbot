const Showtime = require('../models/showtimeModel');
const db = require('../config/db');
const moment = require('moment');
const showtimeService = {
    handleCreateShowtimes: async (data) => {
        const {
            movie_id, room_id, branch_id, cinema_id, show_date,
            isAuto, start_time, end_time, manualTimes,
            format
        } = data;
        const [movies] = await db.execute('SELECT duration FROM movies WHERE id = ?', [movie_id]);
        if (movies.length === 0) throw new Error("Phim không tồn tại");
        const duration = movies[0].duration;
        const breakTime = 20;
        let showtimesToInsert = [];
        if (isAuto) {
            let current = moment(start_time, "HH:mm");
            let closing = moment(end_time, "HH:mm");
            if (closing.isBefore(current)) closing.add(1, 'days');
            while (current.clone().add(duration, 'minutes').isSameOrBefore(closing)) {
                const sTime = current.format("HH:mm:ss");
                const movieEndTime = current.clone().add(duration, 'minutes');
                const eTime = movieEndTime.format("HH:mm:ss");
                showtimesToInsert.push({ start_time: sTime, end_time: eTime });
                current = movieEndTime.add(breakTime, 'minutes');
            }
        } else {
            const times = (manualTimes && manualTimes.length > 0) ? manualTimes : [start_time];
            times.forEach(time => {
                const eTime = moment(time, "HH:mm").add(duration, 'minutes').format("HH:mm:ss");
                showtimesToInsert.push({ start_time: time, end_time: eTime });
            });
        }
        // BIẾN KẾT QUẢ ĐÃ ĐỔI TÊN ĐỂ KHỚP VỚI FRONTEND
        const results = { successCount: 0, failed: 0, conflicts: [] };
        for (const item of showtimesToInsert) {
            try {
                // Sử dụng hàm checkConflict đã sửa ở Model (trả về object thay vì boolean)
                const conflict = await Showtime.checkConflict(room_id, show_date, item.start_time, item.end_time);
                if (conflict) {
                    results.failed++;
                    results.conflicts.push({
                        start_time: item.start_time,
                        movie_title: conflict.movie_title // Lấy từ Model trả về
                    });
                    continue;
                }
                await Showtime.create({
                    movie_id, room_id, branch_id, cinema_id, show_date,
                    start_time: item.start_time,
                    end_time: item.end_time,
                    format: format || '2D'
                });
                results.successCount++; // Đổi từ success -> successCount
            } catch (err) {
                results.failed++;
                console.error("Lưu thất bại:", err);
            }
        }
        return results;
    },
    createMultipleShowtimes: async (data) => {
        const {
            movie_id, room_id, branch_id, cinema_id,
            start_date, end_date, days_of_week,
            start_times,
            manualTimes, // Mảng giờ từ tab thủ công
            isAuto, start_time, end_time, // Thông tin từ tab tự động
            format
        } = data;
        const [movie] = await db.execute('SELECT duration FROM movies WHERE id = ?', [movie_id]);
        if (!movie.length) throw new Error("Phim không tồn tại");
        const duration = movie[0].duration;
        const breakTime = 20; // Đồng nhất 20 phút dọn phòng

        const results = { successCount: 0, failed: 0, conflicts: [] };
        // --- BƯỚC 1: XÁC ĐỊNH DANH SÁCH GIỜ CHIẾU GỐC (SHOWTIMES TO INSERT) ---
        let baseTimes = [];
        if (isAuto) {
            let current = moment(start_time, "HH:mm");
            let closing = moment(end_time, "HH:mm");
            if (closing.isBefore(current)) closing.add(1, 'days');
            while (current.clone().add(duration, 'minutes').isSameOrBefore(closing)) {
                const sTime = current.format("HH:mm:ss");
                const eTime = current.clone().add(duration, 'minutes').format("HH:mm:ss");
                baseTimes.push({ start_time: sTime, end_time: eTime });
                current = current.add(duration + breakTime, 'minutes');
            }
        } else {
            // Thủ công: start_times từ FE gửi lên
            // SỬA PHẦN THỦ CÔNG: Hứng cả 2 nguồn start_times hoặc manualTimes
            const finalManualTimes = start_times || manualTimes || [];
            if (finalManualTimes.length === 0) {
                console.log("DEBUG: Không tìm thấy dữ liệu giờ thủ công trong Payload");
                return results; // Thoát sớm nếu không có giờ
            }
            baseTimes = finalManualTimes.map(t => ({
                start_time: moment(t, "HH:mm").format("HH:mm:ss"),
                end_time: moment(t, "HH:mm").add(duration, 'minutes').format("HH:mm:ss")
            }));
        }
        // --- BƯỚC 2: LẶP QUA TỪNG NGÀY VÀ CHÈN VÀO DB ---
        let currentDay = new Date(start_date);
        const lastDay = new Date(end_date);
        const activeDays = (days_of_week || []).map(Number);
        while (currentDay <= lastDay) {
            const dayOfWeek = currentDay.getDay();
            if (activeDays.includes(dayOfWeek)) {
                const dateString = moment(currentDay).format("YYYY-MM-DD");
                for (const slot of baseTimes) {
                    try {
                        // Check trùng với DB
                        const conflict = await Showtime.checkConflict(
                            room_id, dateString, slot.start_time, slot.end_time
                        );
                        if (!conflict) {
                            await Showtime.create({
                                movie_id, room_id, branch_id, cinema_id,
                                show_date: dateString,
                                start_time: slot.start_time,
                                end_time: slot.end_time,
                                format: format || '2D',
                            });
                            results.successCount++;
                        } else {
                            results.failed++;
                            results.conflicts.push({
                                start_time: `${dateString} ${slot.start_time}`,
                                movie_title: conflict.movie_title
                            });
                        }
                    } catch (err) {
                        results.failed++;
                    }
                }
            }
            currentDay.setDate(currentDay.getDate() + 1);
        }
        return results;
    },
    handleUpdateShowtime: async (id, data) => {
        // 1. Lấy dữ liệu hiện tại (GỐC) từ DB
        const current = await Showtime.getById(id);
        if (!current) throw new Error("Suất chiếu không tồn tại");

        // 2. Gộp dữ liệu: Lấy cái cũ làm nền, cái mới (data) đè lên
        // Cách này đảm bảo movie_id, branch_id... không bao giờ bị undefined
        const finalData = { ...current, ...data };

        // 3. Lấy thời lượng phim để tính lại end_time
        // (Sử dụng finalData.movie_id vì nó chắc chắn tồn tại)
        const [movies] = await db.execute('SELECT duration FROM movies WHERE id = ?', [finalData.movie_id]);
        if (movies.length === 0) throw new Error("Phim không tồn tại");
        const duration = movies[0].duration;
        // 4. Tính toán end_time mới chuẩn định dạng HH:mm:ss
        const momentStart = moment(finalData.start_time, ["HH:mm:ss", "HH:mm"]);
        if (!momentStart.isValid()) throw new Error("Giờ bắt đầu không hợp lệ");

        finalData.end_time = momentStart.clone().add(duration, 'minutes').format("HH:mm:ss");
        // 5. Kiểm tra trùng lịch (Quan trọng: truyền ID để không tự check trùng với chính nó)
        // Bạn cần sửa hàm checkConflict trong Model như tôi đã hướng dẫn trước đó
        const conflict = await Showtime.checkConflict(
            finalData.room_id,
            finalData.show_date,
            finalData.start_time,
            finalData.end_time,
            id
        );
        if (conflict) {
            throw new Error(`Bị trùng lịch với suất chiếu phim: ${conflict.movie_title}`);
        }
        // Trả về Object ĐẦY ĐỦ các cột cho Controller
        return finalData;
    },
    getBookingLayout: async (showtimeId) => {
        // 1. Lấy thông tin suất chiếu
        const showtime = await Showtime.getById(showtimeId);
        if (!showtime) throw new Error("Suất chiếu không tồn tại");
        // 2. Lấy danh sách ghế từ Model (hàm getSeatStates mà ta đã bàn ở bước trước)
        // Nếu bạn chưa thêm getSeatStates vào Model, hãy đảm bảo Model có hàm này
        const seats = await Showtime.getSeatStates(showtimeId, showtime.template_id);
        // 3. Logic bổ sung: Phân loại ghế theo hàng để FE dễ render (tùy chọn)
        // Hoặc bạn có thể để nguyên mảng phẳng để FE tự xử lý
        return {
            showtimeInfo: {
                id: showtime.id,
                movie_title: showtime.movie_title,
                room_name: showtime.room_name,
                show_date: moment(showtime.show_date).format("DD/MM/YYYY"),
                start_time: showtime.start_time,
                end_time: showtime.end_time,
                cinema_name: showtime.cinema_name,
                format: showtime.format
            },
            seats: seats
        };
    }
};

module.exports = showtimeService;