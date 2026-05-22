import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';

const COLORS = ['#4318ff', '#6ad2ff', '#05cd99', '#ffb547', '#ff6d00', '#7a2bda'];

const BranchRevenueChart = ({ data }) => {
    // Hàm format tiền VNĐ đồng nhất
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div style={{
            width: '100%',
            height: 400, // Chiều cao cố định để khớp với layout ngang
            background: '#fff',
            borderRadius: '20px', // Bo góc mềm mại hơn giống PieChart // Shadow nhẹ nhàng đồng nhất
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Tiêu đề với thanh màu trang trí giống biểu đồ bên cạnh */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ width: '4px', height: '20px', backgroundColor: '#00bcd4', marginRight: '10px', borderRadius: '2px' }}></div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#334155;', margin: 0 }}>
                    Doanh Thu Theo Chi Nhánh
                </h3>
            </div>

            <div style={{ flex: 1, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 30, right: 10, left: -20, bottom: 10 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#F4F7FE"
                        />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12, fill: '#A3AED0', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis hide domain={[0, 'dataMax + 1000000']} />

                        <Tooltip
                            cursor={{ fill: '#F4F7FE', radius: 10 }}
                            formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px rgba(0,0,0,0.05)',
                                padding: '12px'
                            }}
                        />

                        <Bar
                            dataKey="value"
                            radius={[10, 10, 10, 10]} // Bo tròn cả 4 góc cho hiện đại
                            barSize={40}
                        >
                            <LabelList
                                dataKey="value"
                                position="top"
                                formatter={(val) => new Intl.NumberFormat('vi-VN').format(val)} // Rút gọn nhãn để tránh đè chữ
                                offset={10}
                                style={{
                                    fill: '#707EAE',
                                    fontSize: '11px',
                                    fontWeight: '600'
                                }}
                            />
                            {data?.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.value > 0 ? COLORS[index % COLORS.length] : '#E0E5F2'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BranchRevenueChart;