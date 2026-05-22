import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';

const OccupancyTrendChart = ({ data }) => {
    return (
        <div style={{ width: '100%', height: 400, background: '#fff', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>Xu hướng Lấp đầy & Lượng vé theo ngày</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />

                    {/* Trục Y bên trái cho Occupancy */}
                    <YAxis yAxisId="left" label={{ value: 'Lấp đầy (%)', angle: -90, position: 'insideLeft' }} />

                    {/* Trục Y bên phải cho Tickets */}
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Số vé', angle: 90, position: 'insideRight' }} />

                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="top" height={36} />

                    {/* Đường biểu diễn Occupancy */}
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="occupancy"
                        name="Tỷ lệ lấp đầy (%)"
                        stroke="#8884d8"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                    />

                    {/* Đường biểu diễn Tickets */}
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="tickets"
                        name="Số vé bán ra"
                        stroke="#82ca9d"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default OccupancyTrendChart;