import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const PaymentMethodChart = ({ data = [] }) => { // 1. Gán giá trị mặc định là mảng rỗng để tránh lỗi .map()

    // Màu chuẩn thương hiệu: Xanh VNPAY, Hồng Momo
    const getMethodColor = (name) => {
        const n = name?.toUpperCase() || '';
        if (n.includes('VNPAY')) return '#1a49aa';
        if (n.includes('MOMO')) return '#d82d8b';
        return '#00a389';
    };

    // Hàm render % trên miếng bánh
    const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.65;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return percent > 0.05 ? (
            <text
                x={x} y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                style={{ fontSize: '12px', fontWeight: 'bold' }}
            >
                {`${(percent * 100).toFixed(1)}%`}
            </text>
        ) : null;
    };

    // 2. Kiểm tra nếu data không tồn tại hoặc không có phần tử nào
    if (!data || data.length === 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px', color: '#a3aed0' }}>
                Đang tải dữ liệu thanh toán...
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderLabel}
                    innerRadius={0}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="name"
                    stroke="#fff"
                    strokeWidth={3}
                >
                    {/* 3. Dùng Optional Chaining để an toàn tuyệt đối */}
                    {data?.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={getMethodColor(entry.name)}
                            style={{ outline: 'none' }}
                        />
                    ))}
                </Pie>
                <Tooltip />
                <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => (
                        <span style={{ color: '#707eae', fontSize: '13px', fontWeight: '500' }}>
                            {value}
                        </span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default PaymentMethodChart;