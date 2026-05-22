import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const TicketTrendLineChart = ({ data }) => {
    // Nếu không có dữ liệu, hiển thị thông báo thay vì biểu đồ trống
    if (!data || data.length === 0) {
        return (
            <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Không có dữ liệu trong khoảng thời gian này</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <h4 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>XU HƯỚNG BÁN VÉ</h4>
            <ResponsiveContainer width="100%" height={300}>
                {/* Dùng AreaChart để có phần đổ bóng phía dưới đường line, nhìn sẽ hiện đại hơn */}
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3f51b5" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3f51b5" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: '#666' }}
                        axisLine={{ stroke: '#f0f0f0' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: '#666' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        labelStyle={{ fontWeight: 'bold' }}
                        formatter={(value) => [value, "Số vé"]} // Đổi tên hiển thị trong Tooltip
                    />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#3f51b5"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorCount)"
                        dot={{ r: 4, fill: '#3f51b5', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TicketTrendLineChart;