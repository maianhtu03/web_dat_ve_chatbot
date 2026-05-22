const revenueModel = require('../models/revenueModel');

// --- HÀM HỖ TRỢ: Tạo danh sách các ngày trong khoảng ---
const getDatesInRange = (startStr, endStr) => {
    const dates = [];
    let curr = new Date(startStr);
    const last = new Date(endStr);

    while (curr <= last) {
        const day = String(curr.getDate()).padStart(2, '0');
        const month = String(curr.getMonth() + 1).padStart(2, '0');
        dates.push(`${day}/${month}`);
        curr.setDate(curr.getDate() + 1);
    }
    return dates;
};
const revenueService = {
    generateRevenueReport: async (startDate, endDate, branchId, cinemaId) => {
        // --- BỔ SUNG: Chuẩn hóa tham số lọc ---
        // Nếu là 'all' hoặc chuỗi rỗng thì chuyển về null để SQL dễ xử lý
        const bId = branchId === 'all' || !branchId ? null : branchId;
        const cId = cinemaId === 'all' || !cinemaId ? null : cinemaId;

        // Truyền tham số đã chuẩn hóa vào Model
        const rawData = await revenueModel.getRevenueReport(startDate, endDate, bId, cId);

        // Giữ nguyên phần logic xử lý bên dưới của Tú...
        const byCinema = rawData.byCinema || [];
        const byMovie = rawData.byMovie || [];
        const byPayment = rawData.byPayment || [];
        const dbDailyTrend = rawData.dailyTrend || [];
        const byBranch = rawData.byBranch || [];
        const total = Number(rawData.totalRevenue) || 0;


        const allDates = getDatesInRange(startDate, endDate);

        const dailyTrend = allDates.map(dateStr => {
            const found = dbDailyTrend.find(item => item.date === dateStr);
            return {
                date: dateStr,
                revenue: found ? Number(found.revenue) : 0
            };
        });

        // 1. Xử lý doanh thu theo rạp
        const revenueByCinema = byCinema.map(item => ({
            name: item.name || 'Không xác định',
            value: Number(item.value) || 0,
            percent: total > 0 ? parseFloat(((Number(item.value) / total) * 100).toFixed(2)) : 0
        }));

        // 2. Rạp cao nhất
        const sortedCinema = [...revenueByCinema].sort((a, b) => b.value - a.value);
        const topCinema = sortedCinema[0] || { name: '---', value: 0, percent: 0 };

        // 3. Xử lý phim
        const revenueByMovie = byMovie.map(item => ({
            name: item.name,
            value: Number(item.value || item.revenue) || 0
        })).sort((a, b) => b.value - a.value);

        const topMovieData = revenueByMovie[0] || { name: '---', value: 0 };

        // 4. Xử lý Phương thức thanh toán
        const paymentMethods = byPayment.map(item => ({
            name: item.name,
            value: Number(item.value) || 0,
            count: Number(item.count) || 0 // Đảm bảo lấy trường count từ SQL
        }));

        // --- SỬA LOGIC TẠI ĐÂY ---
        // Tìm phương thức có SỐ LƯỢNG (count) lớn nhất thay vì giá trị (value)
        const topPayment = paymentMethods.length > 0
            ? paymentMethods.reduce((prev, current) => (prev.count > current.count) ? prev : current)
            : { name: '---', value: 0, count: 0 };

        // Tính tổng số lượng đơn hàng để tính % phổ biến
        const totalOrdersCount = paymentMethods.reduce((sum, item) => sum + item.count, 0);

        const paymentPercent = totalOrdersCount > 0
            ? parseFloat(((topPayment.count / totalOrdersCount) * 100).toFixed(1))
            : 0;
        const revenueByBranch = byBranch.map(item => ({
            name: item.name || 'Chi nhánh lạ',
            value: Number(item.value) || 0
        })).sort((a, b) => b.value - a.value);

        return {
            totalRevenue: total,
            totalOrders: rawData.totalOrders || 0,
            topCinema: topCinema,
            topMovie: {
                name: topMovieData.name,
                revenue: topMovieData.value
            },
            topPaymentMethod: topPayment.name,
            paymentPercent: paymentPercent,
            paymentCount: topPayment.count,
            revenueByCinema,
            revenueByMovie,
            paymentMethods,
            dailyTrend,
            revenueByBranch
        };
    }
};

module.exports = revenueService;