import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ComboRevenueBarChart = ({ data }) => {
    // 1. Kiểm tra dữ liệu rỗng
    const chartData = data && data.length > 0 ? data : [];

    // 2. Tự động lấy danh sách các loại Combo từ dữ liệu (loại bỏ key cinemaName)
    const comboKeys = chartData.length > 0
        ? Object.keys(chartData[0]).filter(key => key !== 'cinemaName')
        : [];

    const COLORS = ['#3498db', '#2c3e50', '#e74c3c', '#2ecc71', '#f1c40f'];

    // 3. Hàm định dạng tiền VNĐ (ví dụ: 9.770.000 VNĐ)
    const formatVND = (value) => {
        return new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ';
    };

    // 4. Hàm định dạng rút gọn cho trục Y (ví dụ: 5.000.000 -> 5M)
    const formatYAxis = (value) => {
        if (value >= 1000000) return `${value / 1000000}M`;
        if (value >= 1000) return `${value / 1000}k`;
        return value;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="cinemaName" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
                <Tooltip
                    formatter={(value) => [formatVND(value), "Doanh thu"]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}
                />
                <Legend iconType="circle" />

                {comboKeys.map((key, index) => (
                    <Bar
                        key={key}
                        dataKey={key}
                        name={key}
                        stackId="a"
                        fill={COLORS[index % COLORS.length]}
                        barSize={45}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
};

export default ComboRevenueBarChart;