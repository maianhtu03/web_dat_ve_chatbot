import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RevenueTrendChart = ({ data = [] }) => {
    // Hàm định dạng tiền VNĐ cho Tooltip
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    return (
        <div style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4318ff" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#4318ff" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E5F2" />

                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: '#A3AED0', fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        dy={10} // Khoảng cách chữ với trục
                        minTickGap={30}
                    />

                    <YAxis
                        tick={{ fontSize: 11, fill: '#A3AED0' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} // Hiện 1.5M thay vì 1500000
                    />

                    <Tooltip
                        contentStyle={{
                            borderRadius: '15px',
                            border: 'none',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                            fontSize: '13px'
                        }}
                        formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                        labelStyle={{ fontWeight: 'bold', color: '#2B3674' }}
                    />

                    <Area
                        type="monotone" // Giúp đường kẻ mềm mại, lượn sóng
                        dataKey="revenue"
                        stroke="#4318ff"
                        fillOpacity={1}
                        fill="url(#colorRev)"
                        strokeWidth={3} // Làm đường kẻ đậm hơn cho nổi bật
                        dot={data?.length > 20 ? false : { r: 4, fill: '#4318ff', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueTrendChart;