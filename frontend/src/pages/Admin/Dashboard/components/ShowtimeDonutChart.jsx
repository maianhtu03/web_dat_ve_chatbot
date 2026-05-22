import React from 'react';
import Chart from 'react-apexcharts';

const ShowtimeDonutChart = ({ data }) => {
    // 1. Kiểm tra và lấy dữ liệu an toàn. 
    // Thêm 'finished' nếu bạn dùng logic SQL 3 trạng thái mình gợi ý lúc nãy.
    const upcoming = data?.upcoming || 0;
    const live = data?.live || 0;
    const finished = data?.finished || 0;

    const series = [upcoming, live, finished];

    const options = {
        // Thứ tự nhãn phải khớp tuyệt đối với thứ tự trong mảng series
        labels: ['Sắp chiếu', 'Đang chiếu', 'Đã chiếu'],

        // Màu sắc: Xanh blue (Chờ), Hồng/Đỏ (Live - nổi bật), Xám (Đã xong)
        colors: ['#4895ef', '#f72585', '#adb5bd'],

        legend: {
            position: 'bottom',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            markers: { radius: 12 }
        },

        stroke: { show: false }, // Bỏ viền giữa các miếng cho hiện đại

        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '14px',
                            offsetY: -10
                        },
                        value: {
                            show: true,
                            fontSize: '20px',
                            fontWeight: 600,
                            offsetY: 10,
                            formatter: (val) => val
                        },
                        total: {
                            show: true,
                            label: 'Tổng suất',
                            color: '#637381',
                            fontSize: '14px',
                            // Tính tổng cho cả 3 trạng thái
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                            }
                        }
                    }
                }
            }
        },
        dataLabels: { enabled: false },
        tooltip: {
            y: {
                formatter: (val) => `${val} suất`
            }
        },
        // Thêm trạng thái khi không có dữ liệu
        noData: {
            text: 'Không có dữ liệu suất chiếu',
            align: 'center',
            verticalAlign: 'middle',
            style: { color: '#adb5bd', fontSize: '14px' }
        }
    };

    return (
        <Chart
            options={options}
            series={series}
            type="donut"
            height={300}
        />
    );
};

export default ShowtimeDonutChart;