import React, { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

/**
 * Component hiển thị xu hướng doanh thu đồ ăn
 * @param {Array} data - Dữ liệu từ API (chỉ gồm các ngày có doanh thu)
 * @param {String} startDate - Ngày bắt đầu lọc (YYYY-MM-DD)
 * @param {String} endDate - Ngày kết thúc lọc (YYYY-MM-DD)
 */
const FoodRevenueTrendChart = ({ data, startDate, endDate }) => {

    // Logic xử lý dữ liệu để điền đầy các ngày trống
    const chartData = useMemo(() => {
        if (!startDate || !endDate) return [];

        // 1. Chuyển dữ liệu từ DB thành Map để tra cứu nhanh (Key: YYYY-MM-DD)
        const dataMap = new Map(
            data?.map(item => [
                new Date(item.date).toISOString().split('T')[0],
                Number(item.revenue)
            ]) || []
        );

        const fullList = [];
        let curr = new Date(startDate);
        const end = new Date(endDate);

        // 2. Chạy vòng lặp từ ngày bắt đầu đến ngày kết thúc
        while (curr <= end) {
            const dateStr = curr.toISOString().split('T')[0];

            fullList.push({
                date: dateStr,
                // Định dạng hiển thị trục X: "Ngày/Tháng"
                displayDate: curr.toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit'
                }),
                // Nếu ngày này không có trong DB, mặc định doanh thu là 0
                revenue: dataMap.get(dateStr) || 0
            });

            // Tăng thêm 1 ngày
            curr.setDate(curr.getDate() + 1);
        }
        return fullList;
    }, [data, startDate, endDate]);

    // Trả về thông báo nếu không có dữ liệu để vẽ
    if (!chartData.length) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#858796',
                fontSize: '0.9rem'
            }}>
                Không có dữ liệu hiển thị cho khoảng thời gian này
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
                {/* Hiệu ứng đổ bóng phía dưới đường line */}
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4e73df" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4e73df" stopOpacity={0} />
                    </linearGradient>
                </defs>

                {/* Lưới ngang mờ */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />

                <XAxis
                    dataKey="displayDate"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6c757d', fontSize: 11 }}
                    interval="preserveStartEnd" // Tự động ẩn bớt nhãn nếu dữ liệu quá dày
                />

                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6c757d', fontSize: 11 }}
                    tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`}
                />

                <Tooltip
                    contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15)'
                    }}
                    formatter={(value) => [
                        new Intl.NumberFormat('vi-VN').format(value) + ' đ',
                        'Doanh thu'
                    ]}
                    labelFormatter={(label) => `Ngày: ${label}`}
                />

                <Area
                    type="monotone" // Đường cong mềm mại
                    dataKey="revenue"
                    stroke="#4e73df"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    // Điểm nút trên đường line
                    dot={{ r: 2, fill: '#4e73df', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default FoodRevenueTrendChart;