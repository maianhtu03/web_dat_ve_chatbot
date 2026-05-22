import React from 'react';
import Chart from 'react-apexcharts';

const RevenueAreaChart = ({ data = [] }) => {
    // data sẽ có dạng: [{date: "19/04", total: 500000}, {date: "20/04", total: 700000}, ...]

    const options = {
        chart: {
            type: 'area',
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: 'Inter, sans-serif'
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        colors: ['#00b4d8'],
        xaxis: {
            // Lấy danh sách các ngày từ mảng data để hiển thị ở trục ngang
            categories: data.length > 0 ? data.map(item => item.date) : [],
            axisBorder: { show: false },
            labels: {
                style: { colors: '#637381' }
            }
        },
        yaxis: {
            labels: {
                formatter: (val) => val.toLocaleString() + ' đ',
                style: { colors: '#637381' }
            }
        },
        fill: {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1 }
        },
        grid: { borderColor: '#f1f1f1' },
        tooltip: {
            x: { format: 'dd/MM' },
            y: {
                formatter: (val) => val.toLocaleString() + ' VNĐ'
            }
        }
    };

    // Tạo series từ dữ liệu total trong mảng data
    const series = [{
        name: 'Doanh thu',
        data: data.length > 0 ? data.map(item => item.total) : []
    }];

    return (
        <Chart
            options={options}
            series={series}
            type="area"
            height={350}
        />
    );
};

export default RevenueAreaChart;