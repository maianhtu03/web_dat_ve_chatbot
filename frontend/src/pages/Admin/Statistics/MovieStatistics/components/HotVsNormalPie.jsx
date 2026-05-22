import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#FF8042', '#0088FE', '#FFBB28', '#00C49F'];

const HotVsNormalPie = ({ data }) => {
    // 1. Kiểm tra dữ liệu đầu vào
    if (!data || data.length === 0) return <p style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu so sánh</p>;

    // 2. Ép kiểu value sang Number để Recharts hiểu được
    const formattedData = data.map(item => ({
        ...item,
        value: parseFloat(item.value) // Chuyển "115000.00" thành 115000
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={formattedData} // Dùng dữ liệu đã ép kiểu
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} // Thêm label để dễ nhìn
                >
                    {formattedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ'}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default HotVsNormalPie;