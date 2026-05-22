import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

const MovieGenrePie = ({ data }) => {
    // 1. Kiểm tra nếu không có dữ liệu
    if (!data || data.length === 0) {
        return <p style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu thể loại</p>;
    }

    // 2. ÉP KIỂU DỮ LIỆU: Chuyển value từ String sang Number
    const formattedData = data.map(item => ({
        ...item,
        value: Number(item.value) // Rất quan trọng: Chuyển "115000.00" thành 115000
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={formattedData} // Dùng dữ liệu đã được ép kiểu
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    // Thêm nhãn % để biểu đồ trông chuyên nghiệp hơn
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                    {formattedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default MovieGenrePie;