import React from 'react';
import Chart from 'react-apexcharts';

const HeatmapChart = ({ data = [] }) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = Array.from({ length: 17 }, (_, i) => i + 7);

    const formatHeatmapData = () => {
        return days.map(day => {
            return {
                name: day === 'Monday' ? 'Thứ 2' :
                    day === 'Tuesday' ? 'Thứ 3' :
                        day === 'Wednesday' ? 'Thứ 4' :
                            day === 'Thursday' ? 'Thứ 5' :
                                day === 'Friday' ? 'Thứ 6' :
                                    day === 'Saturday' ? 'Thứ 7' : 'Chủ Nhật',
                data: hours.map(hour => {
                    const found = data.find(d => d.day_of_week === day && d.show_hour === hour);
                    return {
                        x: `${hour}h`,
                        y: found ? found.count : 0
                    };
                })
            };
        });
    };

    const options = {
        chart: {
            type: 'heatmap',
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
            parentHeightOffset: 0 // Loại bỏ khoảng trắng thừa của ApexCharts
        },
        dataLabels: { enabled: false },
        colors: ["#008FFB"],
        plotOptions: {
            heatmap: {
                shadeIntensity: 0.5,
                radius: 4, // Bổ sung bo góc 4px cho các ô vuông nhìn hiện đại hơn
                useFillColorAsStroke: true,
                colorScale: {
                    ranges: [
                        { from: 0, to: 0, name: 'Không có', color: '#f8fafc' },
                        { from: 1, to: 3, name: 'Thấp', color: '#b3e5fc' },
                        { from: 4, to: 6, name: 'Vừa', color: '#4fc3f7' },
                        { from: 7, to: 100, name: 'Cao', color: '#008FFB' }
                    ]
                }
            }
        },
        // ĐÃ XÓA TITLE Ở ĐÂY ĐỂ TRÁNH TRÙNG LẶP TIÊU ĐỀ
        xaxis: {
            type: 'category',
            labels: { style: { colors: '#64748b', fontSize: '11px' } } // Size chữ nhỏ gọn
        },
        yaxis: {
            labels: { style: { colors: '#64748b', fontSize: '11px' } }
        },
        legend: {
            position: 'top', // Đưa chú thích lên trên cho gọn
            fontSize: '11px',
            markers: { radius: 4 }
        }
    };

    return (
        // Bọc trong thẻ div height 100% để ăn theo thẻ cha
        <div style={{ width: '100%', height: '100%', minHeight: '260px' }}>
            <Chart
                options={options}
                series={formatHeatmapData()}
                type="heatmap"
                height="100%" /* Chuyển từ 350 thành 100% */
            />
        </div>
    );
};

export default HeatmapChart;