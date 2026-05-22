import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const RevenueFormatBar = ({ data }) => {
    const formatVND = (value) => new Intl.NumberFormat('vi-VN').format(value) + ' đ';

    const getColor = (format) => {
        const f = format?.toUpperCase();
        if (f?.includes('IMAX')) return '#8884d8'; // Tím sang trọng cho IMAX
        if (f?.includes('3D')) return '#82ca9d';   // Xanh lá cho 3D
        return '#ffc658';                          // Vàng cho 2D
    };

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="formatName" type="category" axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value) => [formatVND(value), 'Doanh thu']} />
                    <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={30}>
                        {data?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getColor(entry.formatName)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueFormatBar;