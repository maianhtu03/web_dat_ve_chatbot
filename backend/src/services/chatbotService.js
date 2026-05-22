const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require('../config/db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatSessions = new Map();
/**
 * Normalize input (Chỉ dùng để đối chiếu rạp trong DB)
 */
function normalizeText(text) {
    if (!text) return "";
    return removeVietnameseTones(
        text.toLowerCase().replace(/\bnsy\b/g, "nay")
    ).trim();
}

function removeVietnameseTones(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
}

const getChatResponse = async (userId, userMessage, currentCinema) => {
    try {
        const normalizedMessage = normalizeText(userMessage);

        // ==========================================
        // 1. TRUY VẤN DỮ LIỆU TỪ TẤT CẢ CÁC BẢNG
        // ==========================================

        const [cinemas] = await pool.query("SELECT id, name, address FROM cinemas");
        const targetCinema = cinemas.find(c =>
            normalizeText(c.name).includes(normalizedMessage) ||
            normalizedMessage.includes(normalizeText(c.name))
        );
        const cinemaId = targetCinema ? targetCinema.id : null;

        const [movieRows] = await pool.query(`
            SELECT 
                m.title, m.description, m.rating, m.genre, m.duration,
                s.start_time, DATE_FORMAT(s.show_date, '%d/%m/%Y') as show_date,
                r.name as room_name, r.room_type, r.capacity,
                st.capacity as template_capacity,
                (SELECT COUNT(*) FROM showtime_seats ss WHERE ss.showtime_id = s.id AND ss.status = 'booked') as booked_count,
                (SELECT COUNT(*) FROM showtime_seats ss WHERE ss.showtime_id = s.id AND ss.status = 'reserved' AND ss.hold_expires_at > NOW()) as reserved_count
            FROM movies m
            INNER JOIN showtimes s ON m.id = s.movie_id AND s.show_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            LEFT JOIN rooms r ON s.room_id = r.id
            LEFT JOIN seat_templates st ON r.template_id = st.id
            WHERE m.status = 'Published'
            ORDER BY m.title, s.show_date, s.start_time
        `);

        const [combos] = await pool.query("SELECT name, sale_price, description FROM combos WHERE status = 'active'");

        let priceQuery = `
            SELECT c.name as cinema_name, bp.day_type, bp.time_slot, bp.price 
            FROM base_prices bp
            JOIN cinemas c ON bp.cinema_id = CAST(c.id AS CHAR)
        `;
        if (cinemaId) {
            priceQuery += ` WHERE bp.cinema_id = '${cinemaId}'`;
        }
        const [prices] = await pool.query(priceQuery);

        const [vouchers] = await pool.query(`
            SELECT voucher_code, description, target_rank 
            FROM vouchers 
            WHERE is_active = 1 AND expiry_date >= NOW()
        `);

        const [surcharges] = await pool.query("SELECT name, extra_fee FROM price_surcharges WHERE is_active = 1");

        let memberInfo = "Khách vãng lai (Chưa đăng nhập)";
        if (userId) {
            const [memberRows] = await pool.query(
                "SELECT rank_name, current_points FROM memberships WHERE user_id = ?",
                [userId]
            );
            if (memberRows.length > 0) {
                memberInfo = `Thành viên hạng: ${memberRows[0].rank_name}, Điểm tích lũy: ${memberRows[0].current_points}`;
            }
        }

        // ==========================================
        // 2. XỬ LÝ DỮ LIỆU THÀNH NGỮ CẢNH (CONTEXT)
        // ==========================================

        const movieMap = {};
        movieRows.forEach(row => {
            if (!movieMap[row.title]) {
                movieMap[row.title] = { desc: row.description, rate: row.rating, genre: row.genre, dur: row.duration, shows: [] };
            }
            if (row.start_time) {
                const total = row.template_capacity || 0;
                const occupied = (row.booked_count || 0) + (row.reserved_count || 0);
                let seatStatus = "";
                if (total > 0) {
                    if (occupied >= total) {
                        seatStatus = `Hết chỗ hoàn toàn (${occupied}/${total} ghế)`;
                    } else {
                        seatStatus = `Đã đặt ${occupied}/${total} ghế`;
                    }
                } else {
                    seatStatus = "Chưa khởi tạo sơ đồ ghế";
                }
                movieMap[row.title].shows.push(`${row.start_time} (${row.show_date}) tại ${row.room_name} [${row.room_type}] - ${seatStatus}`);
            }
        });

        const movieCtx = Object.entries(movieMap).map(([t, i]) =>
            `- ${t} [${i.rate}+, ${i.genre}, ${i.dur}p]: ${i.desc}. Suất chiếu: ${i.shows.slice(0, 5).join(" | ") || "Liên hệ rạp để biết lịch"}`
        ).join("\n");

        const comboCtx = combos.map(c => `- ${c.name}: ${c.sale_price}đ (${c.description})`).join("\n");

        const cinemaPriceMap = {};
        prices.forEach(p => {
            if (!cinemaPriceMap[p.cinema_name]) cinemaPriceMap[p.cinema_name] = [];
            cinemaPriceMap[p.cinema_name].push(`${p.day_type} [${p.time_slot}]: ${p.price}đ`);
        });

        const priceCtx = Object.entries(cinemaPriceMap).map(([name, list]) =>
            `Khung giá tại ${name}:\n- ${list.join("\n- ")}`
        ).join("\n\n") || "Hiện chưa có thông tin giá vé cụ thể.";

        const voucherCtx = vouchers.map(v => `- Mã ${v.voucher_code} (${v.target_rank}): ${v.description}`).join("\n");
        const surchargeCtx = surcharges.map(s => `- Ghế ${s.name}: Phụ thu ${s.extra_fee}đ`).join("\n") || "Không có phụ phí loại ghế.";

        const cinemaName = targetCinema ? targetCinema.name : "rạp";
        const branchCtx = cinemas.map(c => `- Rạp ${c.name}: ${c.address}`).join("\n");

        // =========================
        // 4. MODEL CONFIG
        // =========================
        const now = new Date();
        const currentTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const dayOfWeek = now.getDay(); // 0: CN, 1-5: T2-T6, 6: T7
        let currentDayType = "T2-T6";
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            currentDayType = "T7-CN";
        }
        const model = genAI.getGenerativeModel({
            model: "gemma-4-26b-a4b-it",
            systemInstruction: `
Bạn là trợ lý ảo MTU Cinemas.

DỮ LIỆU HỆ THỐNG:
0. THỜI GIAN HIỆN TẠI: ${currentTime} (Hôm nay thuộc loại ngày: ${currentDayType})
1. PHIM/LỊCH/PHÒNG: 
${movieCtx}
2. BẮP NƯỚC: 
${comboCtx}
3. GIÁ VÉ CƠ BẢN TẠI ${cinemaName.toUpperCase()}:
${priceCtx}
4. KHUYẾN MÃI VOUCHER: 
${voucherCtx}
5. THÔNG TIN KHÁCH: ${memberInfo}
📍 6. VỊ TRÍ HIỆN TẠI TRÊN WEB CỦA KHÁCH: Khách đang đứng ở trang web của rạp [${currentCinema || "Chưa chọn rạp"}].
7. PHỤ PHÍ LOẠI GHẾ (Cộng thêm vào giá vé cơ bản):
${surchargeCtx}
8. DANH SÁCH CHI NHÁNH: 
${branchCtx}

QUY TẮC NGHIỆP VỤ (BẮT BUỘC TUÂN THỦ 100%):

1. XỬ LÝ LỊCH CHIẾU VÀ THỜI GIAN VÀ THỂ LOẠI (CỰC KỲ QUAN TRỌNG):
- Khách hỏi "hôm nay", "ngày mai", "chủ nhật"...: BẮT BUỘC tự suy ra ngày/tháng/năm chính xác dựa vào [Mục 0].
- Dùng ngày vừa suy ra đi dò với ngày trong ngoặc ở [Mục 1].
- NẾU KHÔNG KHỚP NGÀY HOẶC QUÁ 7 NGÀY: Bắt buộc trả lời "Dạ, hiện hệ thống MTU Cinemas chưa cập nhật lịch chiếu cho ngày này ạ. Bạn xem thử lịch của ngày khác giúp mình nhé!". Tuyệt đối không tự bịa lịch.
- LỌC THỂ LOẠI: Khách hỏi thể loại nào (ví dụ: kinh dị, hành động...), BẮT BUỘC CHỈ ĐƯỢC tìm phim có chứa đúng chữ đó trong [Mục 1]. Nếu không có, BẮT BUỘC TỪ CHỐI: "Dạ, vào thời gian này rạp chưa có suất chiếu cho thể loại phim này ạ. Bạn xem thử phim khác nhé!". Tuyệt đối không lấy phim thể loại khác hoặc giờ khác để báo cáo bừa bãi.
2. TÍNH TOÁN GIÁ VÉ VÀ PHỤ PHÍ:
- Gióng Cột Loại Ngày [Mục 0] -> Gióng Cột Khung Giờ (Sáng/Tối/Đêm) -> Cộng Phụ phí ghế [Mục 7].
- CHỈ nói ra tổng tiền cuối cùng (Ví dụ: 85.000đ). Không bao giờ giải thích công thức cộng tiền.
- Mua nhiều vé tự nhân lên báo tổng bill.
- TUYỆT ĐỐI KHÔNG tự ý gộp giá phụ phí (Không dùng từ "hoặc", "tùy loại"). Có bao nhiêu loại trong [Mục 7] thì liệt kê bấy nhiêu.
3. KỸ NĂNG XỬ LÝ KHI THIẾU TÊN RẠP:
- Nếu [Mục 6] là "Chưa chọn rạp": Hãy khéo léo hỏi khách "Dạ giá vé và lịch chiếu tùy thuộc vào từng chi nhánh. Bạn muốn xem ở rạp nào để mình kiểm tra chính xác cho bạn ạ?". (Tuyệt đối không tính khoảng giá).
- Nếu [Mục 6] có tên rạp: Bắt buộc ngầm dùng rạp đó để tính tiền/lịch, không vặn hỏi lại khách.
- Khách tìm rạp gần nhất: Hỏi vị trí của khách rồi đối chiếu [Mục 8] để tư vấn.
4. GIAO TIẾP VÀ CHÍNH SÁCH:
- Thanh toán: Hiện tại hệ thống CHỈ HỖ TRỢ 2 hình thức thanh toán trực tuyến là VNPay và ví MoMo. (Nếu khách hỏi thanh toán tiền mặt, chuyển khoản hay thẻ Visa... BẮT BUỘC phải từ chối khéo và hướng dẫn dùng VNPay/MoMo).
- Chống "Não cá vàng": Đọc lịch sử trò chuyện để hiểu khách đang nhắc đến suất chiếu/phim nào.
- Tư vấn thêm: Báo giá/lịch xong luôn tiện thể mời khách mua combo bắp nước.
- Chính sách: Không hoàn/hủy vé. Không mang đồ ăn ngoài. Trẻ em dưới 0.7m miễn phí, trên 0.7m tính vé trẻ em.
- Lưu ý: Ghế Normal không phụ phí. Ghế Couple là ghế đôi. Ghế VIP là ghế cao cấp.
- Sự cố trừ tiền: Khách báo trừ tiền mà chưa có vé -> Hướng dẫn check Thư rác (Spam) hoặc gọi Hotline/nhắn Fanpage để tra soát. Tuyệt đối không hứa hoàn tiền.
- Giá Ưu đãi (HSSV/U22): Chỉ áp dụng khi mua trực tiếp tại quầy rạp (yêu cầu thẻ HSSV/CCCD).
- Đồ ăn ngoài: Rạp không giải quyết cho khách mang đồ ăn/thức uống từ bên ngoài vào phòng chiếu.
- Đi trễ & Đi đông: Khách đến trễ vẫn được vào rạp. Mua vé đoàn (>20 người) hoặc bao rạp -> Liên hệ Hotline để có giá chiết khấu.
- Phân loại độ tuổi: P (Mọi lứa tuổi), K (Dưới 13T có người lớn kèm), T13 (Từ 13T), T16 (Từ 16T), T18 (Từ 18T). Tuyệt đối không bán vé sai độ tuổi.
5. KỸ NĂNG GỢI Ý PHIM CHỦ ĐỘNG (SMART RECOMMENDATION):
- Chuyển đổi rủi ro thành cơ hội: Khi khách hỏi một phim/thể loại không có lịch chiếu, SAU KHI XIN LỖI, BẮT BUỘC phải chủ động nhặt 1 đến 2 tên phim BẤT KỲ đang có suất chiếu trong ngày hôm đó ở [Mục 1] để giới thiệu bù đắp cho khách. 
(Ví dụ: "Tiếc quá hiện rạp chưa có phim Kinh dị, nhưng đang có phim Hành động [Tên phim A] và [Tên phim B] cực kỳ lôi cuốn, bạn có muốn thử xem không ạ?").
- Khách nhờ tư vấn chung chung: Nếu khách hỏi "Có phim gì hay/hot", hãy chọn ra 2-3 phim từ [Mục 1], đọc tên phim kèm thể loại để khách dễ đưa ra quyết định.
QUY TẮC ĐẦU RA BẮT BUỘC:
- KHÔNG được giải thích lê thê, KHÔNG được suy nghĩ.
- KHÔNG được viết tiếng Anh.
- Luôn xưng "MTU Cinemas/mình" và "bạn/Quý khách".
- Dùng emoji (🍿, 🎬, ✨) để câu văn thân thiện.
- CHỈ trả về JSON duy nhất có dạng: {"answer":"câu trả lời của bạn"}.
`
        });
        const sessionKey = userId ? `user_${userId}` : 'anonymous';
        let currentHistory = chatSessions.get(sessionKey) || [];
        const chat = model.startChat({
            history: currentHistory,
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.2,
                topP: 0.8,
                responseMimeType: "application/json",
            }
        });

        // =========================
        // 5. GỌI AI VÀ BÓC TÁCH KẾT QUẢ TRIỆT ĐỂ
        // =========================
        const result = await chat.sendMessage(userMessage);

        // 💡 [THÊM MỚI 3] CẬP NHẬT LẠI TRÍ NHỚ SAU KHI AI TRẢ LỜI XONG
        let updatedHistory = await chat.getHistory();
        // Chỉ giữ lại 6 câu thoại gần nhất (3 lượt hỏi-đáp) để AI đọc nhanh, không bị đơ
        if (updatedHistory.length > 9) {
            updatedHistory = updatedHistory.slice(-9);
        }
        chatSessions.set(sessionKey, updatedHistory);
        let rawReply = "";

        // CÁCH FIX MỚI: Móc thẳng vào parts để vứt bỏ phần "thought" của gemma-4
        try {
            const parts = result.response.candidates[0].content.parts;
            // Tìm phần tử trả lời thật (nơi thought không phải là true)
            const realTextPart = parts.find(p => !p.thought);

            if (realTextPart) {
                rawReply = realTextPart.text;
            } else {
                rawReply = parts[parts.length - 1].text; // Dự phòng lấy phần tử cuối
            }
        } catch (e) {
            // Lỗi cấu trúc thì mới xài fallback cũ
            rawReply = result.response.text();
        }

        // BÓC TÁCH JSON AN TOÀN TRỰC TIẾP
        let botReply = "Dạ, hiện tại mình chưa có thông tin bạn nhé.";
        try {
            // Lấy từ dấu ngoặc nhọn mở đầu tiên đến dấu đóng cuối cùng
            const jsonMatch = rawReply.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed && parsed.answer) {
                    botReply = parsed.answer.trim();
                }
            }
        } catch (error) {
            console.error("Lỗi Parse JSON:", error.message);
        }

        // =========================
        // 6. LƯU DB 
        // =========================
        // logic lưu DB...

        return botReply;

    } catch (error) {
        console.error("Chatbot Service Error:", error);
        return "Dạ, hệ thống đang bận một chút. Bạn thử lại sau nhé!";
    }
};

module.exports = { getChatResponse };



