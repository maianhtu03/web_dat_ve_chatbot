const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

const sendTicketEmail = async (userEmail, bookingInfo, combos = []) => {
    try {
        // 1. Tạo mã QR (vẫn để dạng DataURL nhưng chúng ta sẽ xử lý khác đi)
        const qrCodeData = await QRCode.toDataURL(`${bookingInfo.id}`);


        let comboHtml = '';
        if (combos && combos.length > 0) {
            comboHtml = `
                <div style="margin-top: 15px; border-top: 1px dashed #ddd; padding-top: 10px;">
                    <p style="margin-bottom: 8px;"><strong>Đồ ăn & Thức uống / Combo:</strong></p>
                    <table style="width: 100%; font-size: 14px; color: #444;">
                        ${combos.map(item => `
                            <tr>
                                <td style="padding: 2px 0;">• ${item.combo_name} x${item.quantity}</td>
                                <td style="text-align: right;">${(item.sale_price * item.quantity).toLocaleString()} đ</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            `;
        }
        // 2. Cấu hình tài khoản gửi mail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'tumai2774@gmail.com',
                pass: 'qerzfmwfsvqvcxek'
            }
        });

        // 3. Nội dung Email
        const mailOptions = {
            from: '"MTU CINEMA 🍿" <tumai2774@gmail.com>',
            to: userEmail,
            subject: `VÉ XEM PHIM - ${bookingInfo.movie_title}`,
            html: `
                <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; font-family: sans-serif;">
                    <h2 style="text-align: center; color: #007bff;">ĐẶT VÉ THÀNH CÔNG!</h2>
                    <p>Chào bạn, cảm ơn bạn đã lựa chọn MTU Cinema. Dưới đây là thông tin vé của bạn:</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
                        <p><strong>Mã hóa đơn / Vé:</strong> <span style="color: #ff5722; font-weight: bold; font-size: 16px;">${bookingInfo.id}</span></p>
                        <p><strong>Phim:</strong> ${bookingInfo.movie_title}</p>
                        <p><strong>Suất chiếu:</strong> ${bookingInfo.start_time} - ${new Date(bookingInfo.show_date).toLocaleDateString('vi-VN')}</p>
                        <p><strong>Rạp:</strong> ${bookingInfo.cinema_name} - <strong>Phòng:</strong> ${bookingInfo.room_name}</p>
                        <p><strong>Ghế:</strong> ${bookingInfo.seat_labels}</p>
                        ${comboHtml}
                        <p><strong>Tổng tiền:</strong> ${bookingInfo.total_price.toLocaleString()} VNĐ</p>
                    </div>
                    <div style="text-align: center; margin-top: 20px;">
                        <p><strong>MÃ QR VÀO PHÒNG CHIẾU:</strong></p>
                        
                        <img src="cid:qrcode_ticket" alt="QR Code" style="width: 200px;"/>
                        <p style="font-weight: bold; letter-spacing: 2px; margin-top: 5px; color: #333;">${bookingInfo.id}</p>
                        <p style="font-size: 12px; color: #888;">(Vui lòng đưa mã này cho nhân viên soát vé)</p>

                    </div>
                    <hr style="border: none; border-top: 1px dashed #ccc; margin: 25px 0;" />

                <div style="font-size: 13px; color: #555; text-align: center;">
                    <h3 style="font-size: 15px; color: #333; margin-bottom: 10px;">Lưu ý / Note:</h3>
                    <p style="margin: 5px 0;">
                        Vé đã mua không thể hủy, đổi hoặc trả lại. Vui lòng tới rạp theo lịch đã mua hoặc trước giờ chiếu ít nhất 15-30 phút để nhận vé. Vé chỉ có giá trị cho suất chiếu đã mua. Cảm ơn quý khách đã sử dụng dịch vụ của MTU Cinema. Chúc bạn xem phim vui vẻ!
                    </p>
                    <p style="font-style: italic; color: #888; margin-top: 10px;">
                        The purchased movie ticket cannot be cancelled, exchanged or refunded. If you have any question or problems with this order, you can contact Theater Manager or see our Condition to purchase and use movie tickets for more information. Thank you for choosing MTU Cinema ticket and enjoy the movie!
                    </p>
                </div>
                </div>
            `,
            // THÊM PHẦN NÀY: Đính kèm ảnh QR vào mail
            attachments: [
                {
                    filename: 'qrcode.png',
                    path: qrCodeData, // Nodemailer tự hiểu đây là base64
                    cid: 'qrcode_ticket' // Phải trùng với src="cid:qrcode_ticket" ở trên
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        console.log("Email ticket sent successfully with QR!");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = { sendTicketEmail };