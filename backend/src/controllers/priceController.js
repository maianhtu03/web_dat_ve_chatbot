const db = require('../config/db');
const Price = require('../models/priceModel');
const priceService = require('../services/priceService');

// File: controllers/priceController.js

const getPriceConfig = async (req, res) => {
    try {
        const { cinemaId } = req.params;
        const basePrices = await Price.getBasePricesByCinema(cinemaId);
        const surcharges = await Price.getSurchargesByCinema(cinemaId);

        // Format lại khung giờ cho FE dễ so sánh
        const formattedTimeSlots = basePrices.map(p => {
            let start = 0, end = 24;
            if (p.time_slot === 'Trước 18:00') { start = 0; end = 18; }
            else if (p.time_slot === '18:00 - 22:00') { start = 18; end = 22; }
            else if (p.time_slot === 'Sau 22:00') { start = 22; end = 24; }
            return { day_type: p.day_type, start_hour: start, end_hour: end, price: p.price };
        });

        res.status(200).json({
            success: true,
            data: {
                cinema_id: cinemaId,
                base_prices: basePrices, // Trả về mảng gốc để Form sửa lấy đúng day_type/time_slot
                time_slots: formattedTimeSlots,
                // Đảm bảo surcharges luôn là mảng, dù rỗng cũng không để null
                surcharges: surcharges || []
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy cấu hình", error: error.message });
    }
};
const savePriceConfig = async (req, res) => {
    try {
        // Kiểm tra cả 2 trường hợp đặt tên để tránh lỗi undefined
        const cinemaId = req.body.cinema_id || req.body.cinemaId;
        const { basePrices, surcharges } = req.body;

        if (!cinemaId) {
            return res.status(400).json({ message: "Thiếu ID rạp chiếu" });
        }

        await priceService.saveFullPriceConfig(cinemaId, basePrices, surcharges);
        res.status(200).json({ success: true, message: "Cập nhật bảng giá thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lưu cấu hình giá", error: error.message });
    }
};

const getAllConfigs = async (req, res) => {
    try {
        // THAY ĐỔI QUAN TRỌNG: Gọi hàm từ Service thay vì query trực tiếp tại đây
        // Hàm này trong Service sẽ tự động gom base_price và surcharges cho bạn
        const data = await priceService.getAllPriceConfigs();

        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error("Lỗi getAllConfigs:", error);
        res.status(500).json({ message: "Không thể lấy danh sách cấu hình", error: error.message });
    }
};
const deleteFullConfig = async (req, res) => {
    try {
        const { cinemaId } = req.params;

        // 1. Xóa giá cơ bản trong bảng base_prices
        await db.execute(
            'DELETE FROM base_prices WHERE cinema_id = ?',
            [cinemaId]
        );

        // 2. Xóa các phụ thu trong bảng price_surcharges
        await db.execute(
            'DELETE FROM price_surcharges WHERE cinema_id = ?',
            [cinemaId]
        );

        return res.status(200).json({
            success: true,
            message: "Đã xóa toàn bộ cấu hình giá (cơ bản & phụ thu) thành công."
        });
    } catch (error) {
        console.error("Lỗi Backend khi xóa:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống: " + error.message
        });
    }
};
const getCurrentBasePrice = async (req, res) => {
    try {
        const { cinemaId } = req.params;
        const { showtimeDate } = req.query; // Nhận ngày của suất chiếu từ FE (Ví dụ: 2026-04-12)

        // Nếu FE không gửi showtimeDate, mặc định lấy ngày giờ hiện tại của hệ thống
        const targetDate = showtimeDate ? new Date(showtimeDate) : new Date();

        // Gọi Service để xử lý logic check Thứ/Giờ/Ngày lễ phức tạp
        const currentPrice = await priceService.calculateRealTimePrice(cinemaId, targetDate);

        res.status(200).json({
            success: true,
            targetDate: targetDate,
            appliedPrice: currentPrice // Trả về con số 45000 hoặc 55000...
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi tính toán giá thời gian thực", error: error.message });
    }
};
module.exports = { getPriceConfig, savePriceConfig, getAllConfigs, deleteFullConfig, getCurrentBasePrice };

