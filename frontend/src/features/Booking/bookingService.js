// src/features/Booking/bookingService.js

export const bookingService = {
    // 1. Logic cũ của bạn (GIỮ NGUYÊN)
    checkGapSeat: (seat, allSeatsInRow, selectedSeats) => {
        const selectedIds = new Set(selectedSeats.map(s => s.id));
        const sortedRow = [...allSeatsInRow].sort((a, b) => a.order_column - b.order_column);
        selectedIds.add(seat.id);
        for (let i = 0; i < sortedRow.length; i++) {
            const current = sortedRow[i];
            if (!selectedIds.has(current.id) && current.is_booked !== 1 && current.status !== 'hidden') {
                const prev = sortedRow[i - 1];
                const next = sortedRow[i + 1];
                if (prev && next &&
                    (selectedIds.has(prev.id) || prev.is_booked === 1) &&
                    (selectedIds.has(next.id) || next.is_booked === 1)) {
                    return false;
                }
            }
        }
        return true;
    },

    // 2. Logic cũ của bạn (GIỮ NGUYÊN)
    storage: {
        save: (id, data) => {
            const expiresAt = new Date().getTime() + (data.timeLeft * 1000);
            const payload = { selectedSeats: data.selectedSeats, timeLeft: data.timeLeft, expiresAt };
            sessionStorage.setItem(`booking_temp_${id}`, JSON.stringify(payload));
        },
        get: (id) => {
            const raw = sessionStorage.getItem(`booking_temp_${id}`);
            if (!raw) return null;
            const data = JSON.parse(raw);
            const now = new Date().getTime();
            if (now > data.expiresAt) {
                sessionStorage.removeItem(`booking_temp_${id}`);
                return null;
            }
            const remainingSeconds = Math.floor((data.expiresAt - now) / 1000);
            return { ...data, timeLeft: remainingSeconds };
        },
        clear: (id) => { sessionStorage.removeItem(`booking_temp_${id}`); }
    },

    // 3. THÊM MỚI (Để phục vụ tính tiền ở Footer - Không ảnh hưởng logic cũ)
    // Gọi đích danh 'bookingService' thay vì dùng 'this' để tránh lỗi
    calculateTotal: (selectedSeats, priceConfig, showtime) => {
        if (!priceConfig || !showtime || selectedSeats.length === 0) return 0;

        const date = new Date(showtime.show_date);
        const day = date.getDay();
        const currentDayType = (day === 0 || day === 6) ? 'T7-CN' : 'T2-T6';

        // Helper lấy slot
        const hour = parseInt(showtime.start_time.split(':')[0]);
        let currentTimeSlot = (hour >= 18 && hour < 22) ? 'Toi' : (hour >= 22 || hour < 6) ? 'Dem' : 'Sang';

        const activeSlot = priceConfig.base_prices?.find(slot =>
            slot.day_type === currentDayType && slot.time_slot === currentTimeSlot
        );
        const basePrice = activeSlot ? Number(activeSlot.price) : 0;

        let formatFee = 0;
        const movieFormat = (showtime.movie_format || "").toUpperCase();
        if (movieFormat !== '2D') {
            const formatSurcharge = priceConfig.surcharges?.find(sc =>
                sc.type === 'format' && movieFormat.includes(sc.name.toUpperCase())
            );
            formatFee = formatSurcharge ? Number(formatSurcharge.extra_fee) : 0;
        }

        return selectedSeats.reduce((sum, seat) => {
            const type = seat.type?.toLowerCase();
            let seatFee = 0;
            if (type !== 'normal') {
                const seatSurchargeItem = priceConfig.surcharges?.find(sc => {
                    const scName = sc.name.toLowerCase();
                    if (type === 'vip' && scName.includes('vip')) return true;
                    if (type === 'couple' && (scName.includes('đôi') || scName.includes('couple'))) return true;
                    return false;
                });
                seatFee = seatSurchargeItem ? Number(seatSurchargeItem.extra_fee) : 0;
            }
            const finalUnitPrice = basePrice + formatFee + seatFee;
            return sum + (type === 'couple' ? finalUnitPrice * 2 : finalUnitPrice);
        }, 0);
    },

    getGroupedSeats: (selectedSeats, priceConfig, showtime) => {
        if (!selectedSeats.length || !priceConfig || !showtime) return [];
        const groups = {};
        selectedSeats.forEach(seat => {
            const type = seat.type || 'normal';
            // QUAN TRỌNG: Gọi đích danh bookingService.calculateTotal
            const unitPrice = bookingService.calculateTotal([seat], priceConfig, showtime);
            if (!groups[type]) {
                groups[type] = {
                    typeName: type === 'vip' ? 'Ghế VIP' : (type === 'couple' ? 'Ghế đôi' : 'Ghế thường'),
                    count: 0,
                    price: unitPrice,
                    icon: type
                };
            }
            groups[type].count += 1;
        });
        return Object.values(groups);
    }
};