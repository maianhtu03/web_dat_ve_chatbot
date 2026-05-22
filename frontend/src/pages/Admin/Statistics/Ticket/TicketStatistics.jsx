import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Biểu đồ
import TicketTypePieChart from './components/TicketTypePieChart';
import PeakHourBarChart from './components/PeakHourBarChart';
import OccupancyRateChart from './components/OccupancyRateChart';
import TicketTrendLineChart from './components/TicketTrendLineChart';
import TopMoviesPieChart from './components/TopMoviesPieChart';

import ticketStatisticsApi from '../../../../api/ticketStatisticsApi';
import styles from './TicketStatistics.module.css';

import { Ticket, Calendar, Clock, BarChart2, Search, Download } from 'lucide-react';
import { exportMultipleSheetsToExcel } from '../../../../utils/exportExcel';
const TicketStatistics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const formatDate = (date) => date.toISOString().split('T')[0];
    const [filters, setFilters] = useState({
        startDate: formatDate(new Date(new Date().setDate(new Date().getDate() - 30))),
        endDate: formatDate(new Date()),
        branchId: 'all',
        cinemaId: 'all'
    });

    const [branches, setBranches] = useState([]);
    const [cinemas, setCinemas] = useState([]);

    const formatNumber = (num) => new Intl.NumberFormat('vi-VN').format(num || 0);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const result = await ticketStatisticsApi.getTicketReport(
                filters.startDate,
                filters.endDate,
                filters.branchId,
                filters.cinemaId
            );
            if (result) setData(result);
        } catch (error) {
            console.error("Lỗi tải thống kê:", error);
        } finally {
            setLoading(false);
        }
    }, [filters.startDate, filters.endDate, filters.branchId, filters.cinemaId]);
    useEffect(() => {
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // --- FIX LỖI CÚ PHÁP TẠI ĐÂY (Thêm err vào catch) ---
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const branchList = await ticketStatisticsApi.getBranches();
                setBranches(branchList || []);
            } catch (err) {
                console.error("Không thể tải danh sách chi nhánh", err);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        const loadCinemas = async () => {
            if (filters.branchId === 'all') {
                setCinemas([]);
                setFilters(prev => ({ ...prev, cinemaId: 'all' }));
                return;
            }
            try {
                const cinemaList = await ticketStatisticsApi.getCinemas(filters.branchId);
                setCinemas(cinemaList || []);
                setFilters(prev => ({ ...prev, cinemaId: 'all' }));
            } catch (err) {
                console.error("Không thể tải danh sách rạp", err);
            }
        };
        loadCinemas();
    }, [filters.branchId]);

    useEffect(() => {
        fetchStats();
    }, []);

    const summaryStats = useMemo(() => {
        if (!data || !data.occupancyData || data.occupancyData.length === 0) {
            return { totalTickets: 0, avgPerDay: 0, peakHour: '--:--', avgOccupancy: 0 };
        }

        const totalTickets = data.occupancyData.reduce((acc, curr) => acc + (Number(curr.booked) || 0), 0);
        const diffTime = Math.abs(new Date(filters.endDate) - new Date(filters.startDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        const avgPerDay = (totalTickets / diffDays).toFixed(2);

        const peak = (data.peakHourData && data.peakHourData.length > 0)
            ? data.peakHourData.reduce((prev, current) => (prev.count > current.count) ? prev : current)
            : { hour: '--:--', count: 0 };

        const totalRate = data.occupancyData.reduce((acc, curr) => {
            const rate = curr.occupancyRate !== undefined ? parseFloat(curr.occupancyRate) : 0;
            return acc + (isNaN(rate) ? 0 : rate);
        }, 0);

        const avgOccupancy = (totalRate / data.occupancyData.length).toFixed(2);
        return { totalTickets, avgPerDay, peakHour: peak.hour, avgOccupancy };
    }, [data, filters.startDate, filters.endDate]);

    // ==========================================================
    // HÀM XỬ LÝ XUẤT EXCEL: THỐNG KÊ VÉ BÁN (NHIỀU SHEET)
    // ==========================================================
    const handleExportExcel = () => {
        if (!data) {
            alert("Không có dữ liệu để xuất!");
            return;
        }

        // 1. Sheet: Tỷ Lệ Lấp Đầy Rạp Chiếu
        const occupancySheet = {
            sheetName: "Tỷ Lệ Lấp Đầy",
            data: (data.occupancyData || []).map(item => ({
                "Tên Rạp / Phòng": item.theater || 'N/A',
                "Số Lượng Ghế Đã Bán": Number(item.booked) || 0,
                "Số Lượng Ghế Trống": Number(item.empty) || 0,
                "Tổng Sức Chứa (Ghế)": Number(item.total_seats) || 0,
                "Hiệu Suất Lấp Đầy (%)": `${item.occupancyRate || 0}%`
            }))
        };

        // 2. Sheet: Phân Loại Vé (Dịch tên ghế sang Tiếng Việt)
        const typeSheet = {
            sheetName: "Phân Loại Vé",
            data: (data.ticketTypeData || []).map(item => {
                let tenGhe = item.name;
                if (item.name === 'couple') tenGhe = 'Ghế Đôi (Couple)';
                if (item.name === 'vip') tenGhe = 'Ghế VIP';
                if (item.name === 'standard') tenGhe = 'Ghế Thường (Standard)';

                return {
                    "Loại Ghế / Loại Vé": tenGhe,
                    "Số Lượng Vé Đã Bán": Number(item.value) || 0
                };
            })
        };

        // 3. Sheet: Giờ Cao Điểm
        const peakHourSheet = {
            sheetName: "Giờ Cao Điểm",
            data: (data.peakHourData || []).map(item => ({
                "Khung Giờ Đặt Vé": item.hour || '--:--',
                "Số Lượng Giao Dịch": Number(item.count) || 0
            }))
        };

        // 4. Sheet: Biến Động Theo Ngày
        const trendSheet = {
            sheetName: "Biến Động Theo Ngày",
            data: (data.ticketTrendData || []).map(item => ({
                "Thời Gian (Ngày/Tháng)": item.date,
                "Tổng Vé Bán Ra": Number(item.count) || 0
            }))
        };

        // 5. Sheet: Phim Bán Chạy Nhất
        const movieSheet = {
            sheetName: "Top Phim Bán Chạy",
            data: (data.topMoviesData || []).map(item => ({
                "Tên Phim": item.name || 'N/A',
                "Số Lượng Vé Đã Bán": Number(item.value) || 0
            }))
        };

        // Gộp tất cả các mảng trên lại thành 1 file
        const allSheets = [occupancySheet, typeSheet, peakHourSheet, trendSheet, movieSheet];

        // Tạo tên file
        const dateStr = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
        exportMultipleSheetsToExcel(allSheets, `Thong_Ke_Ve_Ban_${dateStr}`);
    };
    return (
        <div className={styles.container}>
            <div className={styles.headerSection}>
                <h2 className={styles.title}>THỐNG KÊ VÉ</h2>

                <div className={styles.filterBar}>
                    <div className={styles.inputGroup}>
                        <label>CHI NHÁNH</label>
                        <select
                            value={filters.branchId}
                            onChange={(e) => setFilters({ ...filters, branchId: e.target.value })}
                        >
                            <option value="all">Tất cả chi nhánh</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>RẠP / PHÒNG</label>
                        <select
                            value={filters.cinemaId}
                            onChange={(e) => setFilters({ ...filters, cinemaId: e.target.value })}
                            disabled={filters.branchId === 'all'}
                        >
                            <option value="all">Tất cả rạp</option>
                            {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>TỪ NGÀY</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))} />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>ĐẾN NGÀY</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))} />
                    </div>

                    <button className={styles.btnFilter} onClick={fetchStats}>
                        <Search size={16} /> Lọc
                    </button>
                    <button
                        onClick={handleExportExcel}
                        disabled={loading || !data}
                        style={{
                            backgroundColor: (loading || !data) ? '#9CA3AF' : '#107C41',
                            color: 'white',
                            padding: '0 16px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: (loading || !data) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: '600',
                            height: '36px', // Khớp với input
                            fontSize: '13px',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap' // Cấm rớt dòng
                        }}
                    >
                        <Download size={16} />
                        Xuất Excel
                    </button>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>Đang cập nhật dữ liệu...</div>
            ) : (
                <>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statInfo}>
                                <p>TỔNG VÉ BÁN RA</p>
                                <h3>{formatNumber(summaryStats.totalTickets)}</h3>
                                <span>Giai đoạn hiện tại</span>
                            </div>
                            <div className={`${styles.iconBox} ${styles.green}`}><Ticket size={24} /></div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statInfo}>
                                <p>TRUNG BÌNH MỖI NGÀY</p>
                                <h3>{summaryStats.avgPerDay}</h3>
                                <span>Vé / ngày</span>
                            </div>
                            <div className={`${styles.iconBox} ${styles.blue}`}><Calendar size={24} /></div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statInfo}>
                                <p>GIỜ CAO ĐIỂM</p>
                                <h3>{summaryStats.peakHour}</h3>
                                <span>Khung giờ đặt nhiều</span>
                            </div>
                            <div className={`${styles.iconBox} ${styles.orange}`}><Clock size={24} /></div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statInfo}>
                                <p>TỶ LỆ LẤP ĐẦY</p>
                                <h3>{summaryStats.avgOccupancy}%</h3>
                                <span>Hiệu suất phòng</span>
                            </div>
                            <div className={`${styles.iconBox} ${styles.purple}`}><BarChart2 size={24} /></div>
                        </div>
                    </div>

                    <div className={styles.chartsGrid}>
                        <div className={styles.chartWrapper}>
                            <TicketTrendLineChart data={data?.ticketTrendData || []} />
                        </div>
                        <div className={styles.chartWrapper}>
                            <TopMoviesPieChart data={data?.topMoviesData || []} />
                        </div>
                    </div>

                    <div className={styles.chartsGrid}>
                        <div className={styles.chartWrapper}>
                            <TicketTypePieChart data={data?.ticketTypeData || []} />
                        </div>
                        <div className={styles.chartWrapper}>
                            <PeakHourBarChart data={data?.peakHourData || []} />
                        </div>
                    </div>

                    <div className={styles.fullWidthChartWrapper}>
                        <OccupancyRateChart data={data?.occupancyData || []} />
                    </div>
                </>
            )}
        </div>
    );
};

export default TicketStatistics;