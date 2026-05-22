import React, { useState, useEffect } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { getBranches } from '../../../api/branchApi';
import { getCinemasByBranch } from '../../../api/cinemaApi';
import styles from './AdminShowtimeFilter.module.css';

const AdminShowtimeFilter = ({ onFilter }) => {
    const [branches, setBranches] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [loadingCinemas, setLoadingCinemas] = useState(false);

    // ĐỒNG BỘ: Dùng đúng tên biến để Manager và API nhận được
    const [filters, setFilters] = useState({
        branchId: '',
        cinemaId: '',
        date: '',
        status: ''
    });

    // 1. Load chi nhánh khi mount
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await getBranches();
                setBranches(res.data || []);
            } catch (error) {
                console.error("Lỗi load chi nhánh:", error);
            }
        };
        fetchBranches();
    }, []);

    // 2. Load rạp khi branchId thay đổi
    useEffect(() => {
        if (filters.branchId) {
            const fetchCinemas = async () => {
                try {
                    setLoadingCinemas(true);
                    const res = await getCinemasByBranch(filters.branchId);
                    setCinemas(res.data || []);
                } catch (error) {
                    console.error("Lỗi load rạp:", error);
                    setCinemas([]);
                } finally {
                    setLoadingCinemas(false);
                }
            };
            fetchCinemas();
        } else {
            setCinemas([]);
        }
    }, [filters.branchId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => {
            const newFilters = { ...prev, [name]: value };
            // Reset rạp khi đổi chi nhánh
            if (name === 'branchId') {
                newFilters.cinemaId = '';
            }
            return newFilters;
        });
    };

    const handleSearch = () => {
        onFilter(filters); // Gửi object {branchId, cinemaId, date, status}
    };

    const handleReset = () => {
        const resetData = { branchId: '', cinemaId: '', date: '', status: '' };
        setFilters(resetData);
        setCinemas([]);
        onFilter(resetData);
    };

    return (
        <div className={styles.filterContainer}>
            <div className={styles.filterGroup}>
                {/* Chọn Chi Nhánh */}
                <select name="branchId" value={filters.branchId} onChange={handleChange}>
                    <option value="">Tất cả chi nhánh</option>
                    {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>

                {/* Chọn Rạp */}
                <select
                    name="cinemaId"
                    value={filters.cinemaId}
                    onChange={handleChange}
                    disabled={!filters.branchId || loadingCinemas}
                >
                    <option value="">
                        {loadingCinemas ? "Đang tải rạp..." : "Tất cả rạp"}
                    </option>
                    {cinemas.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                {/* Chọn Ngày */}
                <input
                    type="date"
                    name="date"
                    value={filters.date}
                    onChange={handleChange}
                />

                {/* Chọn Trạng thái */}
                <select name="status" value={filters.status} onChange={handleChange}>
                    <option value="">Tất cả trạng thái</option>
                    <option value="Active">Đang hoạt động</option>
                    <option value="Inactive">Tạm dừng</option>
                </select>
            </div>

            <div className={styles.buttonGroup}>
                <button className={styles.btnSearch} onClick={handleSearch}>
                    <Search size={18} /> Lọc
                </button>
                <button className={styles.btnReset} onClick={handleReset} title="Làm mới">
                    <RotateCcw size={18} />
                </button>
            </div>
        </div>
    );
};

export default AdminShowtimeFilter;