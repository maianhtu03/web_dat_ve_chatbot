import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OccupancyRateChart = ({ data = [] }) => {
    // BƯỚC QUAN TRỌNG: Ép kiểu dữ liệu về Number để Recharts hiểu được
    const chartData = useMemo(() => {
        if (!Array.isArray(data)) return [];
        return data.map(item => ({
            theater: item.theater,
            // Ép kiểu Number để tránh lỗi String từ API
            booked: Number(item.booked) || 0,
            empty: Number(item.empty) || 0,
        }));
    }, [data]);

    if (chartData.length === 0) return <div>Không có dữ liệu hiển thị</div>;

    return (
        <div style={{ width: '100%', height: 450, background: '#fff', padding: '20px', borderRadius: '15px' }}>
            <h3 style={{ marginBottom: '20px', color: '#2b3674' }}>Tỷ Lệ Lấp Đầy Rạp</h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="theater" />

                    {/* ĐỂ MẶC ĐỊNH: Không thêm domain hay hide ở đây */}
                    <YAxis />

                    <Tooltip />
                    <Legend />

                    {/* stackId="a" sẽ chồng booked lên empty */}
                    <Bar dataKey="booked" name="Ghế đã đặt" stackId="a" fill="#11cdef" barSize={40} />
                    <Bar dataKey="empty" name="Ghế trống" stackId="a" fill="#344767" barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default OccupancyRateChart;