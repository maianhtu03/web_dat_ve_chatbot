const crypto = require("crypto");
const https = require('https');

const generateMomoUrl = async (amount, bookingId, branchId, userId) => {
    // 1. Cấu hình (Nên đưa vào config/momo.js tương tự vnpay)
    const accessKey = 'F8BBA842ECF85';
    const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const partnerCode = 'MOMO';
    const redirectUrl = 'http://localhost:5173/payment-success'; // FE của bạn
    const ipnUrl = 'https://tinsmith-divorcee-spent.ngrok-free.dev/api/payment/momo/ipn'; // Domain thật của bạn
    const requestType = "payWithMethod";
    const orderId = partnerCode + new Date().getTime();
    const requestId = orderId;
    const orderInfo = 'Thanh toan ve xem phim ma ' + bookingId;

    // extraData dùng để truyền branchId/userId về cho IPN
    const extraData = Buffer.from(JSON.stringify({ branchId, bookingId, userId })).toString('base64');

    // 2. Tạo chuỗi ký (Thứ tự tham số cực kỳ quan trọng)
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto.createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

    // 3. Request Body gửi sang MoMo
    const requestBody = JSON.stringify({
        partnerCode, requestId, amount: amount.toString(), orderId, orderInfo,
        redirectUrl, ipnUrl, lang: 'vi', requestType, autoCapture: true,
        extraData, signature
    });

    const options = {
        hostname: 'test-payment.momo.vn',
        port: 443,
        path: '/v2/gateway/api/create',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', e => reject(e));
        req.write(requestBody);
        req.end();
    });
};

module.exports = { generateMomoUrl };