import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const RevenuePieChart = ({ data }) => {
    // Bảng màu hiện đại cho dashboard
    const COLORS = ['#4318ff', '#6ad2ff', '#05cd99', '#ffb547', '#ff6d00', '#7a2bda'];

    // Hàm format tiền VNĐ
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    // Tính tổng để tự tính phần trăm hiển thị trên Tooltip
    const total = data?.reduce((sum, item) => sum + Number(item.value), 0) || 0;

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                >
                    {data?.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            // Nếu doanh thu > 0 thì hiện màu, bằng 0 thì hiện màu xám nhạt cho tinh tế
                            fill={entry.value > 0 ? COLORS[index % COLORS.length] : '#E0E5F2'}
                            style={{ outline: 'none' }}
                        />
                    ))}
                </Pie>

                <Tooltip
                    formatter={(value, name) => {
                        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return [formatCurrency(value), `${name} (${percent}%)`];
                    }}
                    contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                />

                <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => (
                        <span style={{ color: '#707eae', fontSize: '12px', fontWeight: '500' }}>
                            {value}
                        </span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default RevenuePieChart;