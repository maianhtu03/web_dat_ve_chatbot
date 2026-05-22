import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PeakHourBarChart = ({ data = [] }) => {
    const COLORS = ['#5e72e4', '#2dce89', '#fb6340', '#f5365c', '#11cdef'];

    return (
        <div style={{ padding: '24px', borderRadius: '20px', height: '450px' }}>
            <h3 style={{ fontSize: '18px', color: '#2b3674', fontWeight: '700', marginBottom: '5px' }}>Giờ Cao Điểm</h3>
            <p style={{ fontSize: '12px', color: '#a3aed0', marginBottom: '20px' }}>Số lượng vé bán ra theo giờ</p>
            <ResponsiveContainer width="100%" height="80%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#5e72e4', fontWeight: 'bold', fontSize: '12px' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#707eae', fontSize: '12px' }} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" barSize={40} radius={[5, 5, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PeakHourBarChart;