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

const COLORS = ['#FF4D4F', '#FFA940', '#FFEC3D', '#73D13D', '#40A9FF'];

const TopMoviesBar = ({ data }) => {
    if (!data || data.length === 0) {
        return <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Không có dữ liệu Top phim</p>;
    }

    // 1. Ép kiểu và Sắp xếp dữ liệu (Nhiều nhất lên đầu)
    const sortedData = [...data]
        .map(item => ({
            ...item,
            value: Number(item.value) // Đảm bảo là số
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Chỉ lấy Top 5

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart
                data={sortedData}
                layout="vertical"
                margin={{ left: 20, right: 40, top: 20, bottom: 5 }}
            >
                {/* Đường lưới dọc mờ giúp căn chỉnh khoảng cách */}
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />

                <XAxis type="number" hide /> {/* Ẩn trục X để giao diện thoáng hơn */}

                <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={{ fill: '#333', fontSize: 13, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                />

                <Tooltip
                    cursor={{ fill: '#f5f5f5' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`${value} vé`, 'Lượt xem']}
                />

                <Bar
                    dataKey="value"
                    radius={[0, 10, 10, 0]} // Bo tròn đầu cột cho hiện đại
                    barSize={30}
                >
                    {/* Hiển thị số lượng ngay trên đầu cột */}
                    <LabelList
                        dataKey="value"
                        position="right"
                        style={{ fill: '#666', fontSize: 12, fontWeight: 'bold' }}
                        formatter={(val) => `${val} vé`}
                    />

                    {sortedData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            style={{ cursor: 'pointer', transition: '0.3s' }}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default TopMoviesBar;