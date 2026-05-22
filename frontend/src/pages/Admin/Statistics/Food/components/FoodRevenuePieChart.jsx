import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const FoodRevenuePieChart = ({ data }) => {
    // CHỈNH SỬA TẠI ĐÂY: Ép dữ liệu về đúng định dạng name/value mà Recharts cần
    const chartData = data?.map(item => ({
        // Lấy cinemaName nếu có, không thì lấy name, không thì để 'N/A'
        name: item.cinemaName || item.name || 'Không xác định',
        // Lấy revenue hoặc value, ép kiểu về số
        value: Number(item.revenue || item.value || 0)
    })).filter(item => item.value > 0) || []; // Chỉ vẽ những rạp có doanh thu > 0

    if (chartData.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#888' }}>
                Đang tải hoặc không có dữ liệu...
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value" // Key này phải khớp với biến value ở trên
                    nameKey="name"  // Key này phải khớp với biến name ở trên
                    label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                />
                <Legend verticalAlign="bottom" align="center" layout="horizontal" iconType="circle" />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default FoodRevenuePieChart;