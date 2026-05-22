const db = require('../config/db');
const Price = require('../models/priceModel');

// File: priceService.js
const getAllPriceConfigs = async () => {
    try {
        const configuredCinemas = await Price.getConfiguredCinemaIds();

        const fullConfigs = await Promise.all(configuredCinemas.map(async (cfg) => {
            const cinemaId = cfg.cinema_id;

            // 1. Lấy TẤT CẢ mức giá (Sáng, Tối, Đêm...) thay vì chỉ lấy 1 cái mặc định
            const allBasePrices = await Price.getBasePricesByCinema(cinemaId);

            // Lấy 1 cái đại diện để hiện ra bảng danh sách bên ngoài cho đẹp
            const defaultPrice = allBasePrices.find(p => p.day_type.includes('T2')) || allBasePrices[0];

            // 2. Lấy danh sách phụ thu
            const surcharges = await Price.getSurchargesByCinema(cinemaId);

            return {
                cinema_id: cinemaId,
                // QUAN TRỌNG: Phải có dòng này thì Ma trận giá ở FE mới có dữ liệu để hiện
                base_prices: allBasePrices,
                base_price: defaultPrice ? defaultPrice.price : null,
                surcharges: surcharges,
                last_updated: defaultPrice ? defaultPrice.updated_at : null
            };
        }));

        return fullConfigs;
    } catch (error) {
        throw error;
    }
};

const saveFullPriceConfig = async (cinemaId, basePrices, surcharges) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Cập nhật giá sàn
        await Price.updateBasePrices(connection, cinemaId, basePrices);

        // Cập nhật phụ thu
        await Price.clearAndInsertSurcharges(connection, cinemaId, surcharges);

        await connection.commit();
        return { success: true };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
const calculateRealTimePrice = async (cinemaId, targetDate) => {
    const date = new Date(targetDate);
    const day = date.getDay(); // 0: CN, 1: T2...
    const hour = date.getHours();

    // 1. Xác định day_type
    let dayType = 'T2-T6';
    if (day === 0 || day === 6) {
        dayType = 'T7-CN';
    }
    // Note: Thêm logic check bảng ngày lễ nếu cần -> dayType = 'Le'

    // 2. Xác định time_slot (Khớp với DB: Sang, Toi, Dem)
    let timeSlot = 'Sang';
    if (hour >= 18 && hour < 22) timeSlot = 'Toi';
    else if (hour >= 22 || hour < 6) timeSlot = 'Dem';

    // 3. Lấy giá sàn
    const [base] = await db.execute(
        `SELECT price FROM base_prices WHERE cinema_id = ? AND day_type = ? AND time_slot = ?`,
        [cinemaId, dayType, timeSlot]
    );
    const basePrice = base.length > 0 ? parseFloat(base[0].price) : 85000;

    // 4. Lấy phụ thu để gửi về cho FE tự cộng dồn
    const [surcharges] = await db.execute(
        `SELECT type, name, extra_fee FROM price_surcharges WHERE cinema_id = ? AND is_active = 1`,
        [cinemaId]
    );

    return { basePrice, surcharges };
};
module.exports = {
    saveFullPriceConfig,
    getAllPriceConfigs,
    calculateRealTimePrice
};
