import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import styles from '../MovieStatistics.module.css';

const MovieOccupancyBar = ({ data }) => {
    if (!data || data.length === 0) return <div className={styles.noData}>Không có dữ liệu hiệu suất.</div>;

    return (
        <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                    />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} unit="%" domain={[0, 100]} />
                    <Tooltip
                        formatter={(value) => [`${value}%`, "Tỷ lệ lấp đầy"]}
                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="occupancyRate" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40}>
                        <LabelList dataKey="occupancyRate" position="top" formatter={(v) => `${v}%`} style={{ fontSize: '10px', fill: '#64748b' }} />
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.occupancyRate > 70 ? '#10b981' : '#8b5cf6'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MovieOccupancyBar;