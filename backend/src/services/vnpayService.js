const crypto = require("crypto");
const qs = require('qs'); // BẮT BUỘC DÙNG QS
const vnpConfig = require("../config/vnpay");
const { sortObject } = require("../utils/vnpayUtils");

const generatePaymentUrl = (ipAddr, amount, bookingId) => {
    const moment = require('moment');
    let createDate = moment(new Date()).format('YYYYMMDDHHmmss');

    // Ép IP về chuẩn IPv4 để tránh lỗi ::1 trên localhost
    let safeIpAddr = (ipAddr && ipAddr !== '::1') ? ipAddr : '127.0.0.1';

    let vnp_Params = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': vnpConfig.vnp_TmnCode,
        'vnp_Locale': 'vn',
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': bookingId.toString(),
        'vnp_OrderInfo': 'Thanh toan ve xem phim ma ' + bookingId,
        'vnp_OrderType': 'other',
        'vnp_Amount': Math.round(amount * 100),
        'vnp_ReturnUrl': vnpConfig.vnp_ReturnUrl,
        'vnp_IpAddr': safeIpAddr,
        'vnp_CreateDate': createDate
    };

    // 1. Sắp xếp tham số bằng hàm chuẩn
    vnp_Params = sortObject(vnp_Params);

    // 2. Tạo chuỗi signData (DÙNG QS, KHÔNG DÙNG URLSearchParams)
    let signData = qs.stringify(vnp_Params, { encode: false });

    // 3. Băm chuỗi SHA512
    let hmac = crypto.createHmac("sha512", vnpConfig.vnp_HashSecret);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    vnp_Params['vnp_SecureHash'] = signed;

    // 4. Tạo URL cuối cùng
    let queryParams = qs.stringify(vnp_Params, { encode: false });
    return vnpConfig.vnp_Url + '?' + queryParams;
};

module.exports = { generatePaymentUrl };