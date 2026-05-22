import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from '../MovieStatistics.module.css';

const MovieRevenueBar = ({ data }) => {
    if (!data || data.length === 0) return <div className={styles.noData}>Không có dữ liệu doanh thu.</div>;

    // Hàm format tiền Việt cho dễ đọc
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                    />
                    <YAxis
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickFormatter={(value) => `${value / 1000000}M`} // Rút gọn đơn vị Triệu (M)
                    />
                    <Tooltip
                        formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={40}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#3b82f6'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MovieRevenueBar;