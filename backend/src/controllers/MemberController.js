const MemberService = require('../services/MemberService');

const MemberController = {
    /**
     * Lấy thông tin thẻ thành viên
     * GET /api/memberships/:userId
     */
    getMemberInfo: async (req, res) => {
        try {
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({ message: "Thiếu ID người dùng (userId)" });
            }

            // Gọi Service: Đã bao gồm logic tự tạo thẻ và tính toán Progress Bar (Reset mốc)
            const data = await MemberService.getMemberDashboard(userId);

            res.status(200).json(data);
        } catch (error) {
            console.error("Lỗi tại getMemberInfo Controller:", error);
            res.status(500).json({
                message: "Không thể lấy thông tin thành viên",
                error: error.message
            });
        }
    },


    /**
     * API xử lý tích điểm sau khi thanh toán thành công
     * POST /api/memberships/add-transaction
     */
    processPayment: async (req, res) => {
        try {
            const { userId, amount } = req.body;

            if (!userId || amount === undefined) {
                return res.status(400).json({ message: "Thiếu userId hoặc số tiền thanh toán" });
            }

            // Gọi logic xử lý cộng điểm (tỷ lệ động 3%-7%) và kiểm tra nâng hạng/tặng quà
            const result = await MemberService.handleNewTransaction(userId, amount);

            res.status(200).json({
                message: "Thanh toán thành công! Điểm và hạng thẻ đã được cập nhật.",
                data: result // Trả về object chứa earnedPoints, newRank...
            });
        } catch (error) {
            console.error("Lỗi tại processPayment Controller:", error);
            res.status(500).json({
                message: "Lỗi hệ thống khi cập nhật điểm thưởng",
                error: error.message
            });
        }
    },

    /**
     * API Trigger kiểm tra tụt hạng (Dành cho Admin hoặc Cron Job)
     * POST /api/memberships/check-demotion
     */
    checkDemotion: async (req, res) => {
        try {
            // Gọi service xử lý quét các thẻ hết hạn
            await MemberService.processRankDemotion();

            res.status(200).json({ message: "Đã hoàn thành quét và xử lý hạng thẻ hết hạn." });
        } catch (error) {
            console.error("Lỗi tại checkDemotion Controller:", error);
            res.status(500).json({ message: "Lỗi khi xử lý tụt hạng", error: error.message });
        }
    },
    getPointHistory: async (req, res) => {
        try {
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({ message: "Thiếu userId" });
            }

            // Gọi service lấy danh sách giao dịch/biến động điểm
            const history = await MemberService.getPointHistory(userId);

            res.status(200).json(history);
        } catch (error) {
            console.error("Lỗi tại getPointHistory Controller:", error);
            res.status(500).json({
                message: "Không thể lấy lịch sử điểm",
                error: error.message
            });
        }
    },
    spendPoints: async (req, res) => {
        try {
            const { userId, points, description } = req.body;

            if (!userId || !points) {
                return res.status(400).json({ message: "Thiếu thông tin userId hoặc số điểm cần dùng" });
            }

            // Gọi service để thực hiện trừ điểm trong DB
            const result = await MemberService.handleSpendPoints(userId, points, description);

            res.status(200).json({
                message: "Sử dụng điểm thành công!",
                data: result
            });
        } catch (error) {
            console.error("Lỗi tại spendPoints Controller:", error);
            res.status(500).json({
                message: "Lỗi khi thực hiện trừ điểm",
                error: error.message
            });
        }
    }
};

module.exports = MemberController;