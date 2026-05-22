import React, { useState, useEffect } from 'react';
import styles from './ShowtimeStatistics.module.css';
import showtimeStatisticsApi from '../../../../api/showtimeStatisticsApi';
import ShowtimeCards from './components/ShowtimeCards';
import ShowtimeHeatmap from './components/ShowtimeHeatmap';
import TimeSlotBar from './components/TimeSlotBar';
import RoomPerformanceBar from './components/RoomPerformanceBar';
import RevenueFormatBar from './components/RevenueFormatBar';
import OccupancyTrendChart from './components/OccupancyTrendChart';
import OverallOccupancyPie from './components/OverallOccupancyPie';
import TopMoviesChart from './components/TopMoviesChart';


import { Download } from 'lucide-react';
import { exportMultipleSheetsToExcel } from '../../../../utils/exportExcel';
const ShowtimeStatistics = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Data cho Filter
    const [branches, setBranches] = useState([]);
    const [allCinemas, setAllCinemas] = useState([]); // Lưu toàn bộ rạp từ server
    const [filteredCinemas, setFilteredCinemas] = useState([]); // Rạp hiển thị sau khi lọc theo chi nhánh

    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        branchId: 'all', // Để mặc định là 'all' cho đồng bộ với Backend
        cinemaId: 'all'
    });

    // 1. Load Metadata một lần duy nhất khi Mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Gọi API gom (filters) mà mình đã tạo ở bước trước
                const res = await showtimeStatisticsApi.getFilterMetadata();
                if (res.success) {
                    setBranches(res.data.branches);
                    setAllCinemas(res.data.cinemas);
                    setFilteredCinemas(res.data.cinemas);
                }
            } catch (error) {
                console.error("Lỗi load metadata:", error);
            }
        };

        fetchInitialData();
        loadData(); // Tải báo cáo lần đầu
    }, []);

    // 2. Xử lý khi thay đổi Chi nhánh
    const handleBranchChange = (e) => {
        const branchId = e.target.value;
        // Reset rạp về 'all' khi đổi chi nhánh
        setFilters(prev => ({ ...prev, branchId, cinemaId: 'all' }));

        if (branchId === 'all' || branchId === '') {
            setFilteredCinemas(allCinemas);
        } else {
            // Lọc danh sách rạp thuộc chi nhánh đã chọn
            const filtered = allCinemas.filter(c => c.branch_id === parseInt(branchId));
            setFilteredCinemas(filtered);
        }
    };

    // 3. Gọi API lấy báo cáo dựa trên filters hiện tại
    const loadData = async () => {
        setLoading(true);
        try {
            const res = await showtimeStatisticsApi.getShowtimeReport(filters);
            if (res.success) {
                setReportData(res.data);
            }
        } catch (error) {
            console.error("Lỗi fetch báo cáo:", error);
        } finally {
            setLoading(false);
        }
    };
    // ==========================================================
    // BỔ SUNG: HÀM XỬ LÝ XUẤT EXCEL (SUẤT CHIẾU & PHÒNG CHIẾU)
    // ==========================================================
    const handleExportExcel = () => {
        if (!reportData) {
            alert("Không có dữ liệu để xuất!");
            return;
        }

        // Sheet 1: Tổng Quan Hiệu Suất (KPI)
        const kpiSheet = {
            sheetName: "Tổng Quan Hiệu Suất",
            data: [{
                "Tổng Số Suất Chiếu": reportData.kpi?.totalShowtimes || 0,
                "Tổng Phòng Mở Bán": reportData.kpi?.totalRooms || 0,
                "Trung Bình (Vé/Suất)": Math.round(reportData.kpi?.avgTicketsPerShow || 0),
                "Doanh Thu Trung Bình/Suất (VNĐ)": Math.round(reportData.kpi?.avgRevenuePerShow || 0),
                "Tỷ Lệ Lấp Đầy Trung Bình (%)": `${Math.round(reportData.kpi?.avgOccupancyRate || 0)}%`,
                "Số Suất Chiếu Kém Hiệu Quả (<40%)": reportData.kpi?.lowEfficiencyShows || 0
            }]
        };

        // Sheet 2: Xu Hướng Lấp Đầy Theo Ngày
        const trendSheet = {
            sheetName: "Xu Hướng Lấp Đầy",
            data: (reportData.occupancyTrend || []).map(item => ({
                "Ngày / Tháng": item.date,
                "Tổng Số Vé Bán Ra": Number(item.tickets) || 0,
                "Tỷ Lệ Lấp Đầy (%)": `${item.occupancy || 0}%`
            }))
        };

        // Sheet 3: Hiệu Suất Theo Từng Phòng
        const roomSheet = {
            sheetName: "Hiệu Suất Phòng Chiếu",
            data: (reportData.roomPerformance || []).map(item => ({
                "Tên Phòng (Room)": item.roomName || 'N/A',
                "Tỷ Lệ Lấp Đầy Trung Bình (%)": `${item.avgOccupancy || 0}%`
            }))
        };

        // Sheet 4: Doanh Thu Theo Định Dạng
        const formatSheet = {
            sheetName: "Định Dạng Phim",
            data: (reportData.revenueByFormat || []).map(item => ({
                "Định Dạng (2D / 3D / IMAX)": item.formatName || 'Khác',
                "Tổng Doanh Thu (VNĐ)": Number(item.revenue) || 0
            }))
        };

        // Sheet 5: Khung Giờ Vàng
        const timeSlotSheet = {
            sheetName: "Khung Giờ Vàng",
            data: (reportData.timeSlots || []).map(item => ({
                "Khung Giờ Bán Vé": item.timeSlot || 'N/A',
                "Số Lượng Vé Bán Ra": Number(item.tickets) || 0
            }))
        };

        // Sheet 6: Top Phim Kéo Khách Nhất
        const topMoviesSheet = {
            sheetName: "Phim Top Doanh Thu",
            data: (reportData.topMoviesRevenue || []).map(item => ({
                "Tên Bộ Phim": item.name || 'N/A',
                "Tổng Số Suất Chiếu": Number(item.shows) || 0,
                "Tổng Doanh Thu (VNĐ)": Number(item.value) || 0
            }))
        };

        // Sheet 7: Danh Sách Suất Chiếu Lỗ (Low Efficiency)
        // Đây là báo cáo quan trọng nhất để Operation Manager điều chỉnh suất chiếu
        const lowEfficiencySheet = {
            sheetName: "Báo Cáo Suất Chiếu Lỗ",
            data: (reportData.lowEfficiency || []).map(item => {
                // Xử lý ngày hiển thị cho đẹp
                const rawDate = new Date(item.show_date);
                const displayDate = !isNaN(rawDate.getTime()) ? rawDate.toLocaleDateString('vi-VN') : item.show_date;

                return {
                    "Tên Phim": item.title || 'N/A',
                    "Ngày Trình Chiếu": displayDate,
                    "Giờ Bắt Đầu": item.start_time?.substring(0, 5) || 'N/A',
                    "Tên Phòng Chiếu": item.roomName || 'N/A',
                    "Tỷ Lệ Lấp Đầy Kém (%)": `${Math.round(item.occupancy || 0)}%`
                };
            })
        };

        // Gộp tất cả 7 Sheet lại
        const allSheets = [kpiSheet, lowEfficiencySheet, trendSheet, roomSheet, formatSheet, timeSlotSheet, topMoviesSheet];

        // Đặt tên file xuất có chứa ngày
        const dateStr = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
        exportMultipleSheetsToExcel(allSheets, `Thong_Ke_Xuat_Chieu_Phong_${dateStr}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerTitle}>
                <h2>Thống kê Suất chiếu</h2>
            </div>

            {/* BỘ LỌC DỮ LIỆU */}
            <div className={styles.filterSection}>
                <div className={styles.filterGrid}>
                    <div className={styles.filterItem}>
                        <label>CHI NHÁNH</label>
                        <select value={filters.branchId} onChange={handleBranchChange}>
                            <option value="all">Tất cả chi nhánh</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterItem}>
                        <label>RẠP CHIẾU</label>
                        <select
                            value={filters.cinemaId}
                            onChange={(e) => setFilters(prev => ({ ...prev, cinemaId: e.target.value }))}
                        >
                            <option value="all">Tất cả rạp</option>
                            {filteredCinemas.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterItem}>
                        <label>TỪ NGÀY</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                    </div>

                    <div className={styles.filterItem}>
                        <label>ĐẾN NGÀY</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                    </div>

                    <div className={styles.filterAction} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                        <button className={styles.btnSearch} onClick={loadData} disabled={loading}>
                            {loading ? 'ĐANG TẢI...' : 'LỌC'}
                        </button>
                        <button
                            className={styles.btnExport}
                            onClick={handleExportExcel}
                            disabled={loading || !reportData}
                        >
                            <Download size={16} /> {/* Giảm size icon xuống 16 */}
                            Xuất Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* HIỂN THỊ KẾT QUẢ */}
            <ShowtimeCards data={reportData?.kpi} />

            <div className={styles.chartGrid}>

                {/* Heatmap Full Width */}
                <div className={`${styles.chartBox} ${styles.fullWidth}`}>
                    <div className={`${styles.chartBox} ${styles.fullWidth}`}>
                        <OccupancyTrendChart data={reportData?.occupancyTrend} />
                    </div>

                    <div className={styles.chartHeader}>
                        <h3>🔥 Heatmap: Tỷ lệ lấp đầy theo Khung giờ & Phòng</h3>
                    </div>
                    <ShowtimeHeatmap data={reportData?.heatmap} />
                </div>

                <div className={styles.chartBox}>
                    <h3>📊 Hiệu suất sử dụng theo Phòng</h3>
                    <RoomPerformanceBar data={reportData?.roomPerformance} />
                </div>
                <div className={styles.chartBox}>
                    <h3>💎 Doanh thu theo định dạng phim</h3>
                    <RevenueFormatBar data={reportData?.revenueByFormat} />
                </div>
                {/* Biểu đồ khung giờ */}
                <div className={styles.chartBox}>
                    <h3>🕒 Vé bán theo khung giờ</h3>
                    <TimeSlotBar data={reportData?.timeSlots} />
                </div>
                <div className={styles.chartBox}>
                    <OverallOccupancyPie data={reportData?.overallOccupancy} />
                </div>
                <div className={styles.chartBox}>
                    <TopMoviesChart data={reportData?.topMoviesRevenue} />
                </div>

                {/* Bảng suất chiếu kém */}
                <div className={styles.chartBox}>
                    <h3>🧨 Top 10 suất chiếu kém hiệu quả (Occupancy &lt; 40%)</h3>
                    <div className={styles.tableScroll}>
                        <table className={styles.simpleTable}>
                            <thead>
                                <tr>
                                    <th>Phim</th>
                                    <th>Phòng</th>
                                    <th>Bắt đầu</th>
                                    <th>Tỷ lệ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData?.lowEfficiency?.length > 0 ? (
                                    reportData.lowEfficiency.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.title}</td>
                                            <td>{item.roomName}</td>
                                            <td>{item.start_time?.substring(0, 5)}</td>
                                            <td className={styles.textRed}>
                                                {Math.round(item.occupancy)}%
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" style={{ textAlign: 'center' }}>Không có dữ liệu</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowtimeStatistics;