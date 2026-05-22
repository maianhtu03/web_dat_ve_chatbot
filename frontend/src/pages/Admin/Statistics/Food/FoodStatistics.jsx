import React, { useState, useEffect, useCallback } from 'react';
import FoodSummaryCards from './components/FoodSummaryCards';
import FoodRevenuePieChart from './components/FoodRevenuePieChart';
import TopComboBarChart from './components/TopComboBarChart';
import ComboQuantityBarChart from './components/ComboQuantityBarChart';
import ComboRevenueBarChart from './components/ComboRevenueBarChart';
import foodStatisticsApi from '../../../../api/foodStatisticsApi';
import FoodRevenueTrendChart from './components/FoodRevenueTrendChart'; // Dòng thêm mới
import styles from './FoodStatistics.module.css';

// BỔ SUNG 1: Import icon Download và hàm xuất Excel
import { Download } from 'lucide-react';
import { exportMultipleSheetsToExcel } from '../../../../utils/exportExcel';
const FoodStatistics = () => {
    const formatDate = (date) => date.toISOString().split('T')[0];

    // --- State cho Bộ lọc ---
    const [dates, setDates] = useState(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        return {
            startDate: formatDate(start),
            endDate: formatDate(end)
        };
    });
    const [selectedBranch, setSelectedBranch] = useState('all');
    const [selectedCinema, setSelectedCinema] = useState('all');

    // --- State cho Dữ liệu danh mục (Dropdowns) ---
    const [branches, setBranches] = useState([]);
    const [cinemas, setCinemas] = useState([]);

    // --- State cho Dữ liệu thống kê ---
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    // 1. Lấy danh sách Chi nhánh khi component mount
    useEffect(() => {
        const loadBranches = async () => {
            try {
                const res = await foodStatisticsApi.getBranches();
                if (res?.success) setBranches(res.data);
            } catch (err) {
                console.error("Lỗi tải chi nhánh:", err);
            }
        };
        loadBranches();
    }, []);

    // 2. Lấy danh sách Rạp khi Chi nhánh thay đổi
    useEffect(() => {
        const loadCinemas = async () => {
            try {
                // Nếu chọn "Tất cả chi nhánh", có thể lấy tất cả rạp hoặc reset rạp
                const res = await foodStatisticsApi.getCinemas(selectedBranch);
                if (res?.success) {
                    setCinemas(res.data);
                    setSelectedCinema('all'); // Reset về "Tất cả rạp" khi đổi chi nhánh
                }
            } catch (err) {
                console.error("Lỗi tải rạp:", err);
            }
        };
        loadCinemas();
    }, [selectedBranch]);

    // 3. Hàm fetch dữ liệu thống kê chính
    const fetchFoodStats = useCallback(async () => {
        setLoading(true);
        try {
            const response = await foodStatisticsApi.getFoodReport(
                dates.startDate,
                dates.endDate,
                selectedBranch,
                selectedCinema
            );
            if (response?.success) {
                setData(response.data);
            }
        } catch (error) {
            console.error("Lỗi lấy thống kê:", error);
        } finally {
            setLoading(false);
        }
    }, [dates, selectedBranch, selectedCinema]);

    // Tự động load lần đầu
    useEffect(() => {
        fetchFoodStats();
    }, [fetchFoodStats]);

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDates(prev => ({ ...prev, [name]: value }));
    };

    // ==========================================================
    // BỔ SUNG 2: HÀM XỬ LÝ XUẤT EXCEL COMBO ĐA SHEET
    // ==========================================================
    const handleExportExcel = () => {
        if (!data) {
            alert("Không có dữ liệu để xuất!");
            return;
        }

        // Sheet 1: Trend Doanh Thu
        const trendSheet = {
            sheetName: "Doanh Thu Theo Ngày",
            data: (data.trendData || []).map(item => ({
                "Ngày / Tháng": new Date(item.date).toLocaleDateString('vi-VN'),
                "Doanh Thu Thu Về (VNĐ)": Number(item.revenue) || 0
            }))
        };

        // Sheet 2: Top Combo
        const topComboSheet = {
            sheetName: "Top Combo & Đồ Ăn",
            data: (data.topComboData || []).map(item => ({
                "Tên Sản Phẩm": item.name || 'N/A',
                "Doanh Thu (VNĐ)": Number(item.revenue) || 0
            }))
        };

        // Sheet 3: Số Lượng Bán Theo Rạp (Xử lý mảng Object động)
        const quantitySheet = {
            sheetName: "Số Lượng Bán Theo Rạp",
            data: (data.quantityData || []).map(item => {
                const row = { "Tên Rạp Phim": item.cinemaName || 'N/A' };
                Object.keys(item).forEach(key => {
                    if (key !== 'cinemaName') row[key] = Number(item[key]) || 0;
                });
                return row;
            })
        };

        // Sheet 4: Doanh Thu Chi Tiết Theo Rạp (Xử lý mảng Object động)
        const detailRevenueSheet = {
            sheetName: "Doanh Thu Theo Rạp",
            data: (data.detailRevenueData || []).map(item => {
                const row = { "Tên Rạp Phim": item.cinemaName || 'N/A' };
                Object.keys(item).forEach(key => {
                    if (key !== 'cinemaName') row[`DT: ${key} (VNĐ)`] = Number(item[key]) || 0;
                });
                return row;
            })
        };

        // Sheet 5: Tỷ Trọng Doanh Thu
        const distributionSheet = {
            sheetName: "Tỷ Trọng Doanh Thu",
            data: (data.distributionData || []).map(item => ({
                "Tên Rạp Phim": item.name || 'N/A',
                "Tổng Doanh Thu F&B (VNĐ)": Number(item.value) || 0
            }))
        };

        // Gom các sheet và xuất file
        const allSheets = [trendSheet, topComboSheet, quantitySheet, detailRevenueSheet, distributionSheet];
        const dateStr = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
        exportMultipleSheetsToExcel(allSheets, `Thong_Ke_FB_Combo_${dateStr}`);
    };
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>THỐNG KÊ COMBO VÀ ĐỒ ĂN</h2>
            </div>

            {/* Thanh lọc chuẩn theo mẫu ảnh */}
            <div className={styles.filterCard}>
                <div className={styles.filterRow}>
                    <div className={styles.filterItem}>
                        <label>CHI NHÁNH</label>
                        <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                        >
                            <option value="all">Tất cả chi nhánh</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterItem}>
                        <label>RẠP / PHÒNG</label>
                        <select
                            value={selectedCinema}
                            onChange={(e) => setSelectedCinema(e.target.value)}
                        >
                            <option value="all">Tất cả rạp</option>
                            {cinemas.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterItem}>
                        <label>TỪ NGÀY</label>
                        <input
                            type="date"
                            name="startDate"
                            value={dates.startDate}
                            onChange={handleDateChange}
                        />
                    </div>

                    <div className={styles.filterItem}>
                        <label>ĐẾN NGÀY</label>
                        <input
                            type="date"
                            name="endDate"
                            value={dates.endDate}
                            onChange={handleDateChange}
                        />
                    </div>

                    <div className={styles.filterAction}>
                        <button
                            className={styles.btnLoc}
                            onClick={fetchFoodStats}
                            disabled={loading}
                        >
                            {loading ? 'Đang tải...' : 'Lọc'}
                        </button>
                        {/* NÚT XUẤT EXCEL */}
                        <button
                            onClick={handleExportExcel}
                            disabled={loading || !data}
                            style={{
                                backgroundColor: (loading || !data) ? '#9CA3AF' : '#107C41',
                                color: 'white',
                                padding: '0 16px',
                                borderRadius: '6px', /* Bo góc 6px */
                                border: 'none',
                                cursor: (loading || !data) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                fontWeight: '600',
                                height: '36px', /* CHUẨN 36px */
                                fontSize: '13px',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap' /* Cấm rớt dòng */
                            }}
                        >
                            <Download size={16} />
                            Xuất Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Thẻ tổng quan */}
            <div className={styles.cardGrid}>
                <FoodSummaryCards
                    revenue={data?.totalRevenue}
                    quantity={data?.totalQuantity}
                    bestSeller={data?.bestSeller}
                    dateRange={`${dates.startDate} đến ${dates.endDate}`}
                />
            </div>

            {/* Lưới biểu đồ 4 ô */}
            <div className={styles.chartGrid}>
                <div className={styles.chartItem}>
                    <h3>Phân bổ doanh thu theo rạp</h3>
                    <FoodRevenuePieChart data={data?.distributionData} />
                </div>
                <div className={styles.chartItem}>
                    <h3>Top combo có doanh thu cao nhất</h3>
                    <TopComboBarChart data={data?.topComboData} />
                </div>
                <div className={styles.chartItem}>
                    <h3>Số lượng combo theo rạp</h3>
                    <ComboQuantityBarChart data={data?.quantityData} />
                </div>
                <div className={styles.chartItem}>
                    <h3>Doanh thu combo theo rạp</h3>
                    <ComboRevenueBarChart data={data?.detailRevenueData} isDetail={true} />
                </div>

                <div className={styles.trendChartFullWidth}>
                    <div className={styles.chartItem}>
                        <h3>Xu hướng doanh thu đồ ăn theo thời gian</h3>
                        <div style={{ height: '350px', marginTop: '20px' }}>
                            <FoodRevenueTrendChart
                                data={data?.trendData}
                                startDate={dates.startDate}
                                endDate={dates.endDate}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodStatistics;