import React from 'react';
import Chart from 'react-apexcharts';

const MovieBarChart = ({ data = [] }) => {
    // Giả sử data có dạng: [{ title: 'Phim A', revenue: 5000000 }, { title: 'Phim B', revenue: 3000000 }]

    const options = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif'
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                horizontal: true, // Biểu đồ cột ngang nhìn sẽ chuyên nghiệp hơn cho danh sách tên phim dài
                barHeight: '60%',
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => val.toLocaleString(), // Hiển thị số doanh thu ngay trên cột
            style: { fontSize: '12px', colors: ['#fff'] }
        },
        xaxis: {
            // Lấy danh sách tên phim từ data
            categories: data.length > 0 ? data.map(item => item.title) : ['Chưa có dữ liệu'],
            labels: {
                formatter: (val) => (val / 1000000).toFixed(1) + 'M', // Rút gọn đơn vị thành Triệu (M) cho gọn trục X
                style: { colors: '#637381' }
            }
        },
        yaxis: {
            labels: {
                style: { colors: '#637381', fontWeight: 600 }
            }
        },
        colors: ['#4361ee'],
        grid: { borderColor: '#f1f1f1' },
        tooltip: {
            y: {
                formatter: (val) => val.toLocaleString() + ' VNĐ'
            }
        }
    };

    const series = [{
        name: 'Doanh thu',
        // Lấy danh sách số tiền doanh thu tương ứng
        data: data.length > 0 ? data.map(item => item.revenue) : []
    }];

    return (
        <Chart
            options={options}
            series={series}
            type="bar"
            height={300}
        />
    );
};

export default MovieBarChart;