import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OverallOccupancyPie = ({ data }) => {
    const total = data?.reduce((sum, entry) => sum + entry.value, 0) || 0;

    return (
        // 1. Chuyển thành flexbox chiếm 100% không gian của vỏ hộp
        <div style={{ width: '100%', height: '100%', minHeight: '260px', display: 'flex', flexDirection: 'column' }}>

            {/* 2. Căn chỉnh lại thẻ h3 inline cho đồng bộ với các biểu đồ khác (vì thẻ cha chưa có) */}
            <h3 style={{
                fontSize: '14px',
                color: '#334155',
                marginBottom: '16px',
                fontWeight: '600',
                borderLeft: '3px solid #00bcd4',
                paddingLeft: '10px',
                marginTop: '0'
            }}>
                Tỷ lệ lãng phí ghế (Toàn hệ thống)
            </h3>

            {/* 3. Vùng chứa biểu đồ Recharts (flex: 1 để tự co giãn lấp đầy chỗ trống) */}
            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="45%" /* Nhích nhẹ tâm Pie lên trên một chút để chừa chỗ cho Legend */
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data?.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>

                        <Tooltip
                            formatter={(value) => [`${value} ghế`, `${((value / total) * 100).toFixed(1)}%`]}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />

                        {/* Định dạng lại Legend cho nhỏ gọn */}
                        <Legend
                            verticalAlign="bottom"
                            height={20}
                            iconType="circle"
                            wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* 4. Đẩy dòng chữ tổng số xuống đáy một cách tự nhiên (Không cần hack marginTop âm nữa) */}
            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
                Tổng sức chứa: <strong style={{ color: '#1e293b', fontSize: '13px' }}>{total.toLocaleString()}</strong> ghế
            </div>
        </div>
    );
};

export default OverallOccupancyPie;