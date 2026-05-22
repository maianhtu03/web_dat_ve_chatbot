import React, { useState, useEffect } from 'react';
import { DollarSign, Target, Film, CreditCard, Search, Download } from 'lucide-react';
import revenueApi from '../../../../api/revenueApi'; // Chỉ dùng duy nhất Api này
import RevenuePieChart from './components/RevenuePieChart';
import MovieRevenueChart from './components/MovieRevenueChart';
import PaymentMethodChart from './components/PaymentMethodChart';
import RevenueTrendChart from './components/RevenueTrendChart';
import BranchRevenueChart from './components/BranchRevenueChart';
import styles from './RevenueStatistics.module.css';
import { exportMultipleSheetsToExcel } from '../../../../utils/exportExcel';
const RevenueStatistics = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [branches, setBranches] = useState([]);
    const [cinemas, setCinemas] = useState([]);

    const getInitialDates = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        return {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
            branchId: '',
            cinemaId: ''
        };
    };

    const [filters, setFilters] = useState(getInitialDates());

    // 1. Tải danh sách chi nhánh (Dùng hàm mới getBranches)
    useEffect(() => {
        const loadBranches = async () => {
            try {
                const res = await revenueApi.getBranches();
                if (res && res.success) {
                    setBranches(res.data);
                }
            } catch (err) {
                console.error("Lỗi khi tải danh sách chi nhánh:", err);
            }
        };
        loadBranches();
        fetchData();
    }, []);

    // 2. Tải danh sách rạp (Dùng hàm mới getCinemas)
    useEffect(() => {
        const loadCinemas = async () => {
            if (!filters.branchId) {
                setCinemas([]);
                return;
            }
            try {
                const res = await revenueApi.getCinemas(filters.branchId);
                if (res && res.success) {
                    setCinemas(res.data);
                }
            } catch (err) {
                console.error("Lỗi khi tải danh sách rạp:", err);
            }
        };
        loadCinemas();
    }, [filters.branchId]);

    const handleBranchChange = (e) => {
        setFilters({
            ...filters,
            branchId: e.target.value,
            cinemaId: ''
        });
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await revenueApi.getReport(
                filters.startDate,
                filters.endDate,
                filters.branchId,
                filters.cinemaId
            );
            if (res && res.success) {
                setData(res.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải báo cáo:", error);
        } finally {
            setLoading(false);
        }
    };


    // ==========================================================
    // BỔ SUNG: HÀM XỬ LÝ XUẤT EXCEL GỘP 5 BẢNG
    // ==========================================================
    const handleExportExcel = () => {
        if (!data) {
            alert("Không có dữ liệu để xuất!");
            return;
        }

        // 1. Chuẩn bị Sheet: Biến động theo ngày
        const trendSheet = {
            sheetName: "Theo Ngày",
            data: data.dailyTrend.map(item => ({
                "Ngày / Tháng": item.date,
                "Doanh thu (VNĐ)": item.revenue
            }))
        };

        // 2. Chuẩn bị Sheet: Theo Chi Nhánh
        const branchSheet = {
            sheetName: "Theo Chi Nhánh",
            data: data.revenueByBranch.map(item => ({
                "Tên Chi Nhánh": item.name,
                "Doanh thu (VNĐ)": item.value
            }))
        };

        // 3. Chuẩn bị Sheet: Theo Rạp
        const cinemaSheet = {
            sheetName: "Theo Rạp Chiếu",
            data: data.revenueByCinema.map(item => ({
                "Tên Rạp": item.name,
                "Doanh thu (VNĐ)": item.value,
                "Tỷ trọng (%)": `${item.percent}%`
            }))
        };

        // 4. Chuẩn bị Sheet: Theo Phim
        const movieSheet = {
            sheetName: "Theo Phim",
            data: data.revenueByMovie.map(item => ({
                "Tên Phim": item.name,
                "Doanh thu (VNĐ)": item.value
            }))
        };

        // 5. Chuẩn bị Sheet: Theo Thanh Toán
        const paymentSheet = {
            sheetName: "Thanh Toán",
            data: data.paymentMethods.map(item => ({
                "Phương thức": item.name,
                "Số lượng giao dịch": item.count,
                "Doanh thu (VNĐ)": item.value
            }))
        };

        // Gộp tất cả các Sheet lại thành 1 mảng
        const allSheets = [trendSheet, branchSheet, cinemaSheet, movieSheet, paymentSheet];

        // Tạo tên file chứa ngày hiện tại
        const dateStr = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');

        // Gọi hàm xuất ra Excel
        exportMultipleSheetsToExcel(allSheets, `Bao_Cao_Doanh_Thu_${dateStr}`);
    };
    const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
        <div className={styles.statCard}>
            <div className={styles.statInfo}>
                <span className={styles.statTitle}>{title}</span>
                <h3 className={styles.statValue}>{loading ? '...' : value}</h3>
                <p className={styles.statSub}>{subtext}</p>
            </div>
            <div className={`${styles.statIcon} ${styles[colorClass]}`}>
                {Icon && <Icon size={24} />}
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.breadcrumb}>Thống kê &gt; Thống kê doanh thu</div>
                <h2 className={styles.mainTitle}>THỐNG KÊ DOANH THU</h2>
            </div>

            <div className={styles.filterCard}>
                <div className={styles.filterRow}>
                    <div className={styles.filterItem}>
                        <label>CHI NHÁNH</label>
                        <select
                            value={filters.branchId}
                            onChange={handleBranchChange}
                        >
                            <option value="">Tất cả chi nhánh</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterItem}>
                        <label>RẠP / PHÒNG</label>
                        <select
                            value={filters.cinemaId}
                            disabled={!filters.branchId}
                            onChange={(e) => setFilters({ ...filters, cinemaId: e.target.value })}
                        >
                            <option value="">Tất cả rạp</option>
                            {cinemas.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterItem}>
                        <label>TỪ NGÀY</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        />
                    </div>

                    <div className={styles.filterItem}>
                        <label>ĐẾN NGÀY</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </div>

                    <button onClick={fetchData} className={styles.btnAction} disabled={loading}>
                        <Search size={16} />
                        {loading ? '...' : 'Lọc'}
                    </button>
                    {/* BỔ SUNG: NÚT XUẤT EXCEL GẮN CẠNH NÚT LỌC */}
                    <button
                        onClick={handleExportExcel}
                        disabled={loading || !data}
                        style={{
                            backgroundColor: (loading || !data) ? '#9CA3AF' : '#107C41',
                            color: 'white',
                            padding: '0 16px',
                            borderRadius: '6px', // Sửa từ 8px thành 6px
                            border: 'none',
                            cursor: (loading || !data) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: '600',
                            height: '36px', // Đổi height về 36px
                            fontSize: '13px', // Đổi font về 13px
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <Download size={16} />
                        Xuất Excel
                    </button>
                </div>
            </div>

            <div className={styles.cardGrid}>
                <StatCard
                    title="TỔNG DOANH THU"
                    colorClass="green"
                    icon={DollarSign}
                    value={`${((data?.totalRevenue || 0) / 1000000).toFixed(2)}tr`}
                    subtext={`Tổng ${data?.totalOrders || 0} đơn hàng`}
                />
                <StatCard
                    title="RẠP CAO NHẤT"
                    colorClass="blue"
                    icon={Target}
                    value={data?.topCinema?.name || "---"}
                    subtext={`Đạt ${data?.topCinema?.percent || 0}% (${((data?.topCinema?.value || 0) / 1000000).toFixed(2)}tr)`} />
                <StatCard
                    title="PHIM CAO NHẤT"
                    colorClass="orange"
                    icon={Film}
                    value={data?.topMovie?.name || "---"}
                    subtext={`${(data?.topMovie?.revenue || 0).toLocaleString()}đ`}
                />
                <StatCard
                    title="THANH TOÁN PHỔ BIẾN"
                    colorClass="purple"
                    icon={CreditCard}
                    value={data?.topPaymentMethod || "---"}
                    subtext={`Chiếm ${data?.paymentPercent || 0}% (${data?.paymentCount || 0} giao dịch)`}
                />
            </div>

            <div className={styles.chartGrid}>
                <div className={`${styles.chartBox} ${styles.fullWidth}`}>
                    <BranchRevenueChart data={data?.revenueByBranch} />
                </div>
                <div className={styles.chartBox}>
                    <h4>Doanh thu theo rạp</h4>
                    <RevenuePieChart data={data?.revenueByCinema} />
                </div>
                <div className={styles.chartBox}>
                    <h4>Doanh thu theo phim</h4>
                    <MovieRevenueChart data={data?.revenueByMovie} />
                </div>
                <div className={styles.chartBox}>
                    <h4>Phương thức thanh toán</h4>
                    <PaymentMethodChart data={data?.paymentMethods} />
                </div>
                <div className={styles.chartBox}>
                    <h4>Biến động doanh thu</h4>
                    <RevenueTrendChart data={data?.dailyTrend} />
                </div>
            </div>
        </div>
    );
};

export default RevenueStatistics;