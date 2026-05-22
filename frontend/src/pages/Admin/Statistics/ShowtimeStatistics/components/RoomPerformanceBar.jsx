import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LabelList
} from 'recharts';

const RoomPerformanceBar = ({ data }) => {
    // 1. Xử lý dữ liệu: Ép kiểu avgOccupancy về số thực (Float) 
    // để tránh lỗi do Backend trả về kiểu String "0.0000"
    const chartData = data?.map(item => ({
        ...item,
        avgOccupancy: parseFloat(item.avgOccupancy || 0)
    })) || [];

    if (chartData.length === 0) {
        return <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Đang cập nhật dữ liệu phòng...</div>;
    }

    const formatPercent = (value) => {
        if (value === 0) return '0%'; // Hoặc có thể return '' nếu không muốn hiện số 0 trên đầu cột
        return `${Math.round(value)}%`;
    };

    return (
        <div style={{ width: '100%', height: 300, marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 25, right: 30, left: -20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis
                        dataKey="roomName"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#666', fontSize: 12 }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tickFormatter={formatPercent}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#999', fontSize: 12 }}
                    />
                    <Tooltip
                        cursor={{ fill: '#f5f5f5' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [formatPercent(value), 'Tỷ lệ lấp đầy TB']}
                    />
                    <Bar
                        dataKey="avgOccupancy"
                        radius={[6, 6, 0, 0]}
                        barSize={35}
                        // Thêm animation để cột nảy lên cho mượt
                        animationDuration={1000}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                // Logic màu sắc xịn: > 70% Xanh dương, > 40% Cam, còn lại Đỏ
                                fill={entry.avgOccupancy > 70 ? '#3b82f6' : entry.avgOccupancy > 40 ? '#f59e0b' : '#ef4444'}
                            />
                        ))}
                        <LabelList
                            dataKey="avgOccupancy"
                            position="top"
                            formatter={formatPercent}
                            style={{ fill: '#444', fontSize: 12, fontWeight: 'bold' }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RoomPerformanceBar;