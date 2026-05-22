import React, { useEffect, useState } from 'react';
import styles from './AdminDashboard.module.css';
import StatCard from './components/StatCard';
import RevenueAreaChart from './components/RevenueAreaChart';
import HeatmapChart from './components/HeatmapChart';
import ShowtimeDonutChart from './components/ShowtimeDonutChart';
import MovieBarChart from './components/MovieBarChart';
import statisticApi from '../../../api/statisticApi';

const AdminDashboard = () => {
    // Hàm bổ trợ lấy ngày hiện tại định dạng YYYY-MM-DD theo múi giờ VN
    const getTodayVN = () => {
        const now = new Date();
        const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
        return vnTime.toISOString().split('T')[0];
    };

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [branches, setBranches] = useState([]);
    const [cinemas, setCinemas] = useState([]);

    // SỬA TẠI ĐÂY: startDate và endDate đều là ngày hôm nay
    const [filters, setFilters] = useState({
        branchId: 'all',
        cinemaId: 'all',
        startDate: getTodayVN(),
        endDate: getTodayVN()
    });

    useEffect(() => {
        const initDashboard = async () => {
            setLoading(true);
            try {
                // Sử dụng filters đã được set là ngày hôm nay
                const [statRes, branchRes] = await Promise.all([
                    statisticApi.getOverview(filters),
                    statisticApi.getBranches()
                ]);

                if (statRes.success) setData(statRes.data);
                if (branchRes.success) setBranches(branchRes.data);
            } catch (error) {
                console.error("Lỗi khởi tạo Dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        initDashboard();
    }, []);

    useEffect(() => {
        const fetchCinemas = async () => {
            if (filters.branchId === 'all') {
                setCinemas([]);
                return;
            }
            try {
                const res = await statisticApi.getCinemas(filters.branchId);
                if (res.success) setCinemas(res.data);
            } catch (error) {
                console.error("Lỗi lấy danh sách rạp:", error);
            }
        };
        fetchCinemas();
    }, [filters.branchId]);

    const handleApplyFilter = async () => {
        setLoading(true);
        try {
            const result = await statisticApi.getOverview(filters);
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error("Lỗi khi lọc dữ liệu:", error);
            alert("Không thể tải dữ liệu lọc. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !data) return <div className={styles.loading}>Đang tải dữ liệu MTU Cinemas...</div>;
    if (!data) return <div className={styles.error}>Không thể kết nối dữ liệu thống kê.</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Xin chào, Admin! 👋</h1>
                <p>Cập nhật lúc: {new Date().toLocaleTimeString()}</p>
            </div>

            <div className={styles.filterBar}>
                <div className={styles.filterGroup}>
                    <label>Chi nhánh</label>
                    <select
                        value={filters.branchId}
                        onChange={(e) => setFilters({ ...filters, branchId: e.target.value, cinemaId: 'all' })}
                    >
                        <option value="all">Tất cả chi nhánh</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label>Rạp / Phòng</label>
                    <select
                        value={filters.cinemaId}
                        onChange={(e) => setFilters({ ...filters, cinemaId: e.target.value })}
                        disabled={filters.branchId === 'all'}
                    >
                        <option value="all">Tất cả rạp</option>
                        {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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

                <button className={styles.filterBtn} onClick={handleApplyFilter}>
                    {loading ? 'Đang lọc...' : 'Lọc dữ liệu'}
                </button>
            </div>

            <div className={styles.statGrid}>
                <StatCard
                    title="DOANH THU"
                    /* Sửa data.cards.revenue thành data.cards.revenue.value */
                    value={`${Math.round(data.cards.revenue.value || 0).toLocaleString('vi-VN')}đ`}
                    /* Thêm prop trend */
                    trend={data.cards.revenue.trend}
                    color="#00b4d8"
                />
                <StatCard
                    title="TỔNG VÉ"
                    value={data.cards.tickets.value || 0}
                    trend={data.cards.tickets.trend}
                    color="#4895ef"
                />
                <StatCard
                    title="SUẤT CHIẾU"
                    value={data.cards.shows.value || 0}
                    trend={data.cards.shows.trend}
                    color="#f72585"
                />
                <StatCard
                    title="USER MỚI"
                    value={data.cards.users.value || 0}
                    trend={data.cards.users.trend}
                    color="#3f37c9"
                />
            </div>

            <div className={styles.chartMain}>
                <div className={styles.chartBox}>
                    <h3>Biểu đồ doanh thu</h3>
                    <RevenueAreaChart data={data.revenueChart} />
                </div>
            </div>

            <div className={styles.lowerGrid}>
                <div className={styles.chartBox}>
                    <h3>Mật độ suất chiếu theo khung giờ</h3>
                    <HeatmapChart data={data.heatmapData} />
                </div>
                <div className={styles.chartBox}>
                    <h3>Top phim doanh thu cao</h3>
                    <div className={styles.flexCharts}>
                        <MovieBarChart data={data.topMovies} />

                    </div>
                </div>
                <div className={styles.chartBox}>
                    <h3>Trạng thái xuất chiếu</h3>
                    <ShowtimeDonutChart data={data.showtimeStatus} />
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;