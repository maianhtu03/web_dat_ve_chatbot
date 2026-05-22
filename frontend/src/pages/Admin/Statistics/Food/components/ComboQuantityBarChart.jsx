import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ComboQuantityBarChart = ({ data, isRevenue = false }) => {
    // 1. Kiểm tra dữ liệu rỗng
    const chartData = data && data.length > 0 ? data : [];

    // 2. Tự động lấy danh sách các loại Combo từ dữ liệu (loại bỏ key cinemaName)
    // Cách này giúp biểu đồ tự vẽ các cột mà không cần code cứng tên "Sweet Combo..."
    const comboKeys = chartData.length > 0
        ? Object.keys(chartData[0]).filter(key => key !== 'cinemaName')
        : [];

    // Bảng màu đẹp cho các loại combo
    const COLORS = ['#3498db', '#2c3e50', '#e74c3c', '#2ecc71', '#f1c40f'];

    // Hàm định dạng số hiển thị trên Tooltip
    const formatValue = (value) => {
        if (isRevenue) {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
        }
        return `${value} combo`;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey="cinemaName"
                    tick={{ fontSize: 12 }}
                    interval={0}
                />
                <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => isRevenue ? `${value / 1000}k` : value}
                />
                <Tooltip
                    formatter={(value) => formatValue(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />

                {/* 3. Tự động tạo các cột chồng (Bars) dựa trên dữ liệu thực tế */}
                {comboKeys.map((key, index) => (
                    <Bar
                        key={key}
                        dataKey={key}
                        name={key} // Hiển thị tên combo đúng trên Legend
                        stackId="a"
                        fill={COLORS[index % COLORS.length]}
                        barSize={40}
                        radius={index === comboKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} // Bo góc nhẹ cho cột trên cùng
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
};

export default ComboQuantityBarChart;