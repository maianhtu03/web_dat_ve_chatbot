import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

const MovieStackedBar = ({ data }) => {
    if (!data || data.length === 0) return <p>Không có dữ liệu biểu đồ</p>;

    // Lấy danh sách tên phim từ dữ liệu để tạo các cột chồng (Bar)
    const movieKeys = Object.keys(data[0]).filter(key => key !== 'cinemaName');

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="cinemaName" />
                <YAxis />
                <Tooltip
                    formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                {movieKeys.map((key, index) => (
                    <Bar
                        key={key}
                        dataKey={key}
                        stackId="a"
                        fill={COLORS[index % COLORS.length]}
                        radius={index === movieKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
};

export default MovieStackedBar;