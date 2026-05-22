import React, { useState, useEffect } from 'react';

const MemberInfo = () => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Lấy dữ liệu từ localStorage mà bạn đã lưu ở trang Login
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Lỗi parse user data:", error);
            }
        }
    }, []);

    // Lưu ý: Sử dụng đúng tên trường trong Database/Backend trả về (fullName, phone, email)
    return (
        <div style={{
            border: '1px solid #ddd',
            padding: '20px',
            marginBottom: '20px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px'
        }}>
            <h3 style={{
                color: '#00355a',
                fontSize: '18px',
                borderBottom: '2px solid #00355a',
                paddingBottom: '10px',
                marginBottom: '15px',
                textTransform: 'uppercase'
            }}>
                <i className="fa fa-user" style={{ marginRight: '10px' }}></i>
                Thông tin thanh toán
            </h3>

            <div style={{ lineHeight: '2' }}>
                <p style={{ margin: '5px 0' }}>
                    Họ tên: <strong style={{ color: '#333' }}>{currentUser?.fullName || 'Đang tải...'}</strong>
                </p>
                <p style={{ margin: '5px 0' }}>
                    Số điện thoại: <strong style={{ color: '#333' }}>{currentUser?.phone || 'Chưa cập nhật'}</strong>
                </p>
                <p style={{ margin: '5px 0' }}>
                    Email: <strong style={{ color: '#333' }}>{currentUser?.email || 'Đang tải...'}</strong>
                </p>
            </div>

            <p style={{ fontSize: '12px', color: '#888', marginTop: '10px', fontStyle: 'italic' }}>
                (*) Thông tin được lấy tự động từ hồ sơ thành viên của bạn.
            </p>
        </div>
    );
};

export default MemberInfo;