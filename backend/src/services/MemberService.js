const MemberModel = require('../models/MemberModel');
const VoucherService = require('./VoucherService'); // MỞ COMMENT VÀ SỬ DỤNG FILE NÀY
const db = require('../config/db');
const MemberService = {
    // 1. Cấu hình tập trung các mốc
    TIER_CONFIG: {
        'Standard': {
            rate: 0.03,
            nextLimit: 3000000,
            nextRank: 'VIP',
            maintainLimit: 0
        },
        'VIP': {
            rate: 0.05,
            nextLimit: 8000000,
            nextRank: 'VVIP',
            maintainLimit: 3000000
        },
        'VVIP': {
            rate: 0.07,
            nextLimit: 15000000,
            nextRank: 'DIAMOND',
            maintainLimit: 8000000
        }
    },

    /**
     * Dashboard: Lấy thông tin hiển thị Card
     */
    getMemberDashboard: async (userId) => {
        let member = await MemberModel.findByUserId(userId);

        if (!member) {
            const newMemberCode = `MTU${Date.now().toString().slice(-10)}`;
            await MemberModel.create({ user_id: userId, member_code: newMemberCode });
            member = await MemberModel.findByUserId(userId);
        }

        const currentRank = member.rank_name || 'Standard';
        const config = MemberService.TIER_CONFIG[currentRank];
        const totalSpent = Number(member.total_spending) || 0;

        let minProgress = 0;
        if (currentRank === 'VIP') minProgress = 3000000;
        else if (currentRank === 'VVIP') minProgress = 8000000;

        const maxProgress = config.nextLimit;
        const progressPercent = Math.min(
            ((totalSpent - minProgress) / (maxProgress - minProgress)) * 100,
            100
        );

        return {
            ...member,
            currentRate: config.rate * 100,
            progressPercent: Math.max(progressPercent, 0),
            minProgress,
            maxProgress,
            remainingToNext: Math.max(maxProgress - totalSpent, 0),
            nextRankName: config.nextRank
        };
    },
    getPointHistory: async (userId) => {
        const rawHistory = await MemberModel.getPointHistory(userId);

        return rawHistory.map(item => {
            const isUsed = Number(item.points_used) > 0;

            // Tính toán điểm dựa trên hạng thẻ (giả sử 3% nếu không có points_earned)
            let displayPoints = 0;
            if (isUsed) {
                displayPoints = item.points_used;
            } else {
                // Nếu points_earned trong DB bị 0, ta lấy total_price * 0.03 làm mặc định
                displayPoints = item.points_earned > 0 ? item.points_earned : Math.floor(item.total_price * 0.03);
            }

            return {
                payment_date: item.payment_date || item.created_at,
                points: Number(displayPoints),
                content: isUsed ? 'Sử dụng điểm thanh toán' : 'Tích điểm đơn hàng',
                type: isUsed ? 'minus' : 'plus',
                totalPrice: item.total_price
            };
        });
    },
    handleSpendPoints: async (userId, points, description) => {
        const member = await MemberModel.findByUserId(userId);

        if (!member || member.current_points < points) {
            throw new Error("Số dư điểm không đủ để thực hiện giao dịch");
        }

        const result = await MemberModel.usePoints(userId, points);

        // Bạn có thể thêm log vào bảng point_history ở đây nếu có

        return {
            remainingPoints: member.current_points - points,
            usedPoints: points
        };
    },


    /**
     * Xử lý giao dịch và TẶNG VOUCHER KHI THĂNG HẠNG
     */
    handleNewTransaction: async (userId, billAmount, bookingId) => {
        // 1. Lấy thông tin thành viên hiện tại
        let member = await MemberModel.findByUserId(userId);
        if (!member) {
            const newMemberCode = `MTU${Date.now().toString().slice(-10)}`;
            await MemberModel.create({ user_id: userId, member_code: newMemberCode });
            member = await MemberModel.findByUserId(userId);
        }

        const currentRank = member.rank_name || 'Standard';
        const currentTotalSpent = Number(member.total_spending) || 0;

        // 2. TÍNH TOÁN TRƯỚC: Hạng thẻ mục tiêu sau khi cộng đơn hàng này
        const projectedTotalSpent = currentTotalSpent + Number(billAmount);
        let targetRank = 'Standard';

        if (projectedTotalSpent >= 15000000) targetRank = 'DIAMOND'; // Thêm mốc nếu cần
        else if (projectedTotalSpent >= 8000000) targetRank = 'VVIP';
        else if (projectedTotalSpent >= 3000000) targetRank = 'VIP';
        else targetRank = 'Standard';

        // 3. LẤY TỶ LỆ: Dùng targetRank để khách được hưởng lợi ngay nếu thăng hạng
        const config = MemberService.TIER_CONFIG[targetRank] || MemberService.TIER_CONFIG['Standard'];
        const rate = config.rate;
        const earnedPoints = Math.floor(billAmount * rate);

        // 4. CẬP NHẬT DATABASE (Bảng memberships)
        // Cộng dồn chi tiêu và điểm tích lũy mới vào thẻ
        await MemberModel.updateSpending(userId, billAmount, earnedPoints);

        // 5. CẬP NHẬT DATABASE (Bảng bookings)
        // Ghi đè con số earnedPoints chuẩn vào đơn hàng để lịch sử hiển thị đúng
        if (bookingId) {
            await db.execute(
                "UPDATE bookings SET points_earned = ? WHERE id = ?",
                [earnedPoints, bookingId]
            );
        }

        // 6. XỬ LÝ THĂNG HẠNG VÀ TẶNG QUÀ
        if (targetRank !== currentRank) {
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);

            // Cập nhật tên hạng mới và ngày hết hạn mới vào DB
            await MemberModel.updateRank(userId, targetRank, expiryDate);

            try {
                // Tặng voucher chào mừng hạng mới
                await VoucherService.giveVoucherByTargetRank(userId, targetRank);
            } catch (vError) {
                console.error("Lỗi khi tặng voucher thăng hạng:", vError);
            }
        }

        // 7. Trả về kết quả cho Controller
        return {
            earnedPoints,
            appliedRate: rate * 100, // Trả về số % để dễ debug (VD: 5)
            oldRank: currentRank,
            newRank: targetRank,
            totalSpending: projectedTotalSpent,
            isRankUp: targetRank !== currentRank
        };
    },
    /**
     * Logic tụt hạng (Cron Job)
     */
    processRankDemotion: async () => {
        const expiredMembers = await MemberModel.getExpiredMembers();

        for (const member of expiredMembers) {
            const config = MemberService.TIER_CONFIG[member.rank_name];

            if (member.total_spending < config.maintainLimit) {
                let lowerRank = 'Standard';
                if (member.rank_name === 'VVIP') lowerRank = 'VIP';

                await MemberModel.updateRank(member.user_id, lowerRank);
            } else {
                const newExpiry = new Date();
                newExpiry.setFullYear(newExpiry.getFullYear() + 1);
                await MemberModel.extendExpiry(member.user_id, newExpiry);
            }
        }
    }
};

module.exports = MemberService;