import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// 1. Khai báo bộ màu sắc cho các phim (Tú có thể thay đổi màu tùy ý)
const COLORS = ['#3f51b5', '#009688', '#ffc107', '#ff5722', '#03a9f4', '#e91e63'];

// 2. Component nhận data từ parent truyền vào
const TopMoviesPieChart = ({ data }) => {
    // console.log("Dữ liệu Top Phim:", data); // Tú dùng cái này để check xem dữ liệu về đúng chưa

    return (
        <div style={{ width: '100%', height: 350 }}>
            <h4 style={{ textAlign: 'center', marginBottom: '10px', textTransform: 'uppercase' }}>
                Top Phim Bán Chạy
            </h4>

            {/* 3. ResponsiveContainer giúp biểu đồ tự co giãn theo khung chứa */}
            <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 30, left: 0 }}>
                    {/* 4. Cấu hình Pie: innerRadius > 0 sẽ tạo ra Doughnut chart */}
                    <Pie
                        data={data}
                        cx="50%" // Vị trí tâm x (giữa)
                        cy="50%" // Vị trí tâm y (giữa)
                        innerRadius={60} // Bán kính vòng trong (lỗ trống)
                        outerRadius={80} // Bán kính vòng ngoài
                        paddingAngle={5} // Khoảng cách giữa các miếng
                        dataKey="value" // Tên trường dữ liệu chứa số lượng (SQL trả về)
                        nameKey="name" // Tên trường dữ liệu chứa tên phim (SQL trả về)
                        // 5. Cấu hình hiển thị % label trên biểu đồ
                        label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                    >
                        {/* 6. Gán màu cho từng miếng dựa trên mảng COLORS */}
                        {data?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>

                    {/* 7. Tooltip hiện ra khi di chuột vào miếng bánh */}
                    <Tooltip
                        formatter={(value, name) => [`${value} vé`, name]} // Format hiển thị
                    />

                    {/* 8. Chú thích màu phim ở phía dưới (Đây là phần Tú đang cần) */}
                    <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle" // Kiểu icon (tròn, vuông...)
                        iconSize={10}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TopMoviesPieChart;