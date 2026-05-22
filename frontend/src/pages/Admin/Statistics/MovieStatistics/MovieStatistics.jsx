import React, { useState, useEffect } from 'react';
import styles from './MovieStatistics.module.css';
import movieStatisticsApi from '../../../../api/movieStatisticsApi';
import MovieCards from './components/MovieCards';
import MovieStackedBar from './components/MovieStackedBar';
import MovieGenrePie from './components/MovieGenrePie';
import HotVsNormalPie from './components/HotVsNormalPie';
import TopMoviesBar from './components/TopMoviesBar';
// THÊM: Import component mới
import MovieStatusPie from './components/MovieStatusPie';
import MovieTicketsBar from './components/MovieTicketsBar';
import MovieRevenueBar from './components/MovieRevenueBar';
import MovieOccupancyBar from './components/MovieOccupancyBar';
// BỔ SUNG: Import icon Download và hàm tiện ích Xuất Excel
import { Download } from 'lucide-react';
import { exportMultipleSheetsToExcel } from '../../../../utils/exportExcel';
const MovieStatistics = () => {
    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        branchId: '',
        cinemaId: ''
    });

    const [reportData, setReportData] = useState(null);
    const [branches, setBranches] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Tải metadata (Chi nhánh & Rạp) ngay khi load trang
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [bRes, cRes] = await Promise.all([
                    movieStatisticsApi.getBranches(),
                    movieStatisticsApi.getCinemas()
                ]);

                if (bRes && bRes.success) {
                    const bData = Array.isArray(bRes.data) ? bRes.data : (bRes.data?.data || []);
                    setBranches(bData);
                }

                if (cRes && cRes.success) {
                    const cData = Array.isArray(cRes.data) ? cRes.data : (cRes.data?.data || []);
                    setCinemas(cData);
                }
            } catch (err) {
                console.error("Lỗi tải metadata:", err);
            }
        };
        fetchMetadata();
        loadData(); // Tải báo cáo lần đầu
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await movieStatisticsApi.getMovieReport(filters);
            if (res.success) setReportData(res.data);
        } catch (error) {
            console.error("Lỗi fetch thống kê:", error);
        } finally {
            setLoading(false);
        }
    };

    // THÊM: Chuẩn bị dữ liệu cho biểu đồ trạng thái phim từ dữ liệu summary
    const movieStatusData = reportData?.summary ? [
        { name: 'Đang chiếu', value: reportData.summary.currentlyShowing || 0 },
        { name: 'Sắp chiếu', value: reportData.summary.comingSoon || 0 }
    ] : [];

    // ==========================================================
    // BỔ SUNG: HÀM XỬ LÝ XUẤT EXCEL (THỐNG KÊ PHIM - 6 SHEET)
    // ==========================================================
    const handleExportExcel = () => {
        if (!reportData) {
            alert("Không có dữ liệu để xuất!");
            return;
        }

        // Sheet 1: Tổng quan phim hệ thống
        const summarySheet = {
            sheetName: "Tổng Quan Phim",
            data: [{
                "Tổng Số Phim Trong Hệ Thống": reportData.summary?.totalMovies || 0,
                "Phim Đang Trình Chiếu": reportData.summary?.currentlyShowing || 0,
                "Phim Sắp Chiếu": reportData.summary?.comingSoon || 0,
                "Phim HOT Nhất Hiện Tại": reportData.summary?.topHotMovie || 'N/A',
                "Phim Bán Chạy Nhất": reportData.summary?.bestSellerMovie || 'N/A'
            }]
        };

        // Sheet 2: Hiệu suất lấp đầy
        const occupancySheet = {
            sheetName: "Hiệu Suất Lấp Đầy",
            data: (reportData.occupancyRateByMovie || []).map(item => ({
                "Tên Bộ Phim": item.name || 'N/A',
                "Số Vé Thực Bán (Ghế)": Number(item.ticketsSold) || 0,
                "Tổng Sức Chứa Mở Bán (Ghế)": Number(item.totalCapacity) || 0,
                "Tỷ Lệ Lấp Đầy (%)": `${item.occupancyRate || 0}%`
            }))
        };

        // Sheet 3: Doanh thu theo từng phim
        const revenueMovieSheet = {
            sheetName: "Doanh Thu Từng Phim",
            data: (reportData.revenueByMovie || []).map(item => ({
                "Tên Bộ Phim": item.name || 'N/A',
                "Tổng Doanh Thu (VNĐ)": Number(item.revenue) || 0
            }))
        };

        // Sheet 4: Doanh thu phim phân bổ tại rạp (Xử lý Object động Pivot Table)
        const revenueCinemaSheet = {
            sheetName: "Phân Bổ Phim Tại Rạp",
            data: (reportData.revenueByCinema || []).map(item => {
                const row = { "Tên Rạp Phim": item.cinemaName || 'N/A' };
                Object.keys(item).forEach(key => {
                    if (key !== 'cinemaName') {
                        // Thêm tiền tố DT để Kế toán biết đây là cột Doanh thu
                        row[`DT: ${key} (VNĐ)`] = Number(item[key]) || 0;
                    }
                });
                return row;
            })
        };

        // Sheet 5: Phân tích theo Thể loại
        const genreSheet = {
            sheetName: "Theo Thể Loại",
            data: (reportData.genreStats || []).map(item => ({
                "Thể Loại Phim": item.name || 'N/A',
                "Doanh Thu Thu Về (VNĐ)": Number(item.value) || 0
            }))
        };

        // Sheet 6: Cơ cấu Phim Hot vs Phim Thường
        const hotNormalSheet = {
            sheetName: "Cơ Cấu Phim HOT",
            data: (reportData.hotVsNormal || []).map(item => ({
                "Phân Loại Phim": item.name || 'N/A',
                "Doanh Thu Thu Về (VNĐ)": Number(item.value) || 0
            }))
        };

        // Gộp tất cả các Sheet
        const allSheets = [summarySheet, occupancySheet, revenueMovieSheet, revenueCinemaSheet, genreSheet, hotNormalSheet];

        // Đặt tên file xuất
        const dateStr = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
        exportMultipleSheetsToExcel(allSheets, `Thong_Ke_Phim_${dateStr}`);
    };
    return (
        <div className={styles.container}>
            <h2 className={styles.pageTitle}>Thống kê Phim</h2>

            <div className={styles.filterSection}>
                <div className={styles.filterGroup}>
                    <label>Chi nhánh</label>
                    <select
                        value={filters.branchId}
                        onChange={(e) => setFilters({ ...filters, branchId: e.target.value, cinemaId: '' })}
                    >
                        <option value="">Tất cả chi nhánh</option>
                        {branches && branches.length > 0 && branches.map(b => (
                            <option key={b.id} value={b.id}>
                                {b.name || b.branchName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label>Rạp chiếu</label>
                    <select
                        value={filters.cinemaId}
                        onChange={(e) => setFilters({ ...filters, cinemaId: e.target.value })}
                    >
                        <option value="">Tất cả rạp</option>
                        {cinemas && cinemas.length > 0 && cinemas
                            .filter(c => {
                                if (!filters.branchId) return true;
                                return String(c.branch_id || c.branchId) === String(filters.branchId);
                            })
                            .map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name || c.cinemaName}
                                </option>
                            ))
                        }
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label>Từ ngày</label>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                </div>

                <div className={styles.filterGroup}>
                    <label>Đến ngày</label>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                </div>

                {/* BỔ SUNG: Bọc nút Lọc và nút Xuất Excel vào chung 1 nhóm để căn lề cho đẹp */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <button className={styles.btnSearch} onClick={loadData} disabled={loading} style={{ height: '38px' }}>
                        {loading ? '...' : 'LỌC'}
                    </button>

                    <button
                        onClick={handleExportExcel}
                        disabled={loading || !reportData}
                        style={{
                            backgroundColor: (loading || !reportData) ? '#9CA3AF' : '#107C41',
                            color: 'white',
                            padding: '0 16px',
                            borderRadius: '4px', // Bo góc nhẹ cho giống btnSearch của bạn
                            border: 'none',
                            cursor: (loading || !reportData) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            height: '38px', // Căn bằng chiều cao của btnSearch
                            transition: 'all 0.2s',
                        }}
                    >
                        <Download size={18} />
                        Xuất Excel
                    </button>
                </div>
            </div>

            {loading && !reportData ? (
                <div className={styles.loadingOverlay}>Đang xử lý dữ liệu...</div>
            ) : (
                <>
                    <MovieCards data={reportData?.summary} />

                    <div className={styles.chartGrid}>
                        <div className={`${styles.chartBox} ${styles.fullWidth}`}>
                            <h3>🎟️ Thống kê lượng vé bán ra theo phim</h3>
                            {/* Dữ liệu lấy từ ticketsByMovie mà Service đã trả về */}
                            <MovieTicketsBar data={reportData?.ticketsByMovie} />
                        </div>
                        <div className={`${styles.chartBox} ${styles.fullWidth}`}>
                            <h3>💰 Phân tích doanh thu thực tế theo phim</h3>
                            <MovieRevenueBar data={reportData?.revenueByMovie} />
                        </div>
                        <div className={`${styles.chartBox} ${styles.fullWidth}`}>
                            <h3>📊 Tỷ lệ lấp đầy theo phim (%)</h3>
                            <MovieOccupancyBar data={reportData?.occupancyRateByMovie} />
                        </div>
                        {/* THÊM: Biểu đồ trạng thái phim hệ thống */}
                        <div className={styles.chartBox}>
                            <h3>Trạng thái phim hệ thống</h3>
                            <MovieStatusPie data={movieStatusData} />
                        </div>

                        <div className={styles.chartBox}>
                            <h3>Doanh thu phim theo rạp</h3>
                            <MovieStackedBar data={reportData?.revenueByCinema} />
                        </div>

                        <div className={styles.chartBox}>
                            <h3>Tỷ lệ doanh thu theo thể loại</h3>
                            <MovieGenrePie data={reportData?.genreStats} />
                        </div>

                        <div className={styles.chartBox}>
                            <h3>Cơ cấu: Phim Hot vs Phim Thường</h3>
                            <HotVsNormalPie data={reportData?.hotVsNormal} />
                        </div>

                        <div className={styles.chartBox}>
                            <h3>Xếp Hạng Phim Theo Lượng Vé Bán Ra</h3>.
                            <TopMoviesBar data={reportData?.topMovies} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MovieStatistics;