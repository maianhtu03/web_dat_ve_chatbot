const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS, // Phải khớp với DB_PASS trong .env của bạn
    database: process.env.DB_NAME
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Lỗi kết nối Database:', err.message);
    } else {
        console.log('✅ Kết nối MySQL thành công (Database: ' + process.env.DB_NAME + ')');
        connection.release(); // Giải phóng kết nối sau khi kiểm tra xong
    }
});

module.exports = pool.promise();