import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Cell, LabelList
} from 'recharts';

const TopMoviesChart = ({ data }) => {
    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(value);
    };

    // Sửa lỗi hàm renderCustomLabel (image_9417ff.png)
    const renderCustomLabel = (props) => {
        const { x, y, index } = props;
        // Lấy tên phim trực tiếp từ payload của Recharts để đảm bảo chính xác
        const movieName = data[index]?.name || "";

        return (
            <text
                x={x}
                y={y - 10} // Đẩy chữ lên trên thanh bar một chút
                fill="#374151"
                fontSize={12}
                fontWeight="600"
                textAnchor="start"
            >
                {movieName}
            </text>
        );
    };

    return (
        <div style={{ width: '100%', height: 400, padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '25px', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🔥 Top 5 Phim Doanh Thu Cao Nhất
            </h3>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    // Tăng margin left để không bị mất chữ nếu bạn muốn hiện ở trục Y, 
                    // nhưng ở đây ta dùng CustomLabel nên để left nhỏ cho thoáng
                    margin={{ top: 20, right: 100, left: 10, bottom: 5 }}
                >
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        hide // Ẩn trục Y gốc vì đã có CustomLabel phía trên thanh bar
                    />

                    <Tooltip
                        cursor={{ fill: '#f9fafb', radius: 4 }}
                        formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />

                    <Bar
                        dataKey="value"
                        radius={[0, 10, 10, 0]}
                        barSize={20}
                    >
                        {/* 1. Hiển thị Tên phim phía trên thanh bar */}
                        <LabelList content={renderCustomLabel} />

                        {/* 2. Hiển thị Số tiền ở cuối thanh bar (dễ nhìn hơn image_946e13.png) */}
                        <LabelList
                            dataKey="value"
                            position="right"
                            formatter={formatCurrency}
                            style={{ fill: '#6b7280', fontSize: '11px', fontWeight: 'bold' }}
                            offset={15}
                        />

                        {data?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TopMoviesChart;