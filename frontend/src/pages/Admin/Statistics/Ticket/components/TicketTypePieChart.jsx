import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const TicketTypePieChart = ({ data = [] }) => {
    // Màu theo mẫu: VIP (Xanh navy), Thường (Xanh ngọc), Đôi (Vàng cam)
    const COLORS = ['#344767', '#2dce89', '#fb6340'];

    return (
        <div style={{ padding: '24px', borderRadius: '20px', height: '450px' }}>
            <h3 style={{ fontSize: '18px', color: '#2b3674', fontWeight: '700', marginBottom: '5px' }}>Phân Loại Vé</h3>
            <p style={{ fontSize: '12px', color: '#a3aed0', marginBottom: '20px' }}>Phân bổ theo loại vé</p>
            <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%" cy="50%"
                        innerRadius={80} // Tạo lỗ hổng Donut
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        formatter={(value) => <span style={{ color: '#707eae', fontWeight: '500', fontSize: '13px' }}>{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TicketTypePieChart;