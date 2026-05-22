import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';

const MovieRevenueChart = ({ data = [] }) => { // Gán mặc định là mảng rỗng []

    // 1. Kiểm tra an toàn: Nếu data chưa có hoặc không phải mảng thì không render map/length
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#a3aed0', backgroundColor: '#fff', borderRadius: '15px' }}>
                Đang tải dữ liệu doanh thu phim...
            </div>
        );
    }

    // 2. Tính chiều cao động dựa trên số lượng phim (để không bị nén biểu đồ)
    // Mỗi phim khoảng 50px chiều cao
    const dynamicHeight = Math.max(data.length * 50 + 50, 350);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    // Mảng màu sắc hiện đại cho biểu đồ
    const COLORS = ['#4318FF', '#6AD2FF', '#39B8FF', '#5E3AFF', '#01B574', '#FFB547'];

    return (
        <div style={{ width: '100%', height: dynamicHeight, backgroundColor: '#fff', padding: '20px', borderRadius: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical" // Chuyển sang cột ngang để hiện được nhiều phim
                    margin={{ top: 5, right: 150, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f5" />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={150}
                        tick={{ fill: '#707eae', fontSize: 12, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: '#f4f7fe' }}
                        formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" barSize={25} radius={[0, 10, 10, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        {/* Hiện con số doanh thu trực tiếp sau cột */}
                        <LabelList
                            dataKey="value"
                            position="right"
                            formatter={(val) => formatCurrency(val)}
                            style={{ fill: '#2b3674', fontSize: '12px', fontWeight: 'bold' }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MovieRevenueChart;