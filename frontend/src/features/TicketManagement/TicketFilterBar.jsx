import React from 'react';
import { Search } from 'lucide-react'; // Dùng icon từ thư viện lucide bạn đang có
import styles from './TicketFilterBar.module.css';

const TicketFilterBar = ({ filters, onFilterChange, branches, movies, cinemas }) => {
    return (
        <div className={styles.container}>
            {/* Hàng 1: Các bộ lọc Select */}
            <div className={styles.filterGrid}>
                <div className={styles.filterItem}>
                    <label>Chi nhánh</label>
                    <select
                        value={filters.branch}
                        onChange={(e) => onFilterChange('branch', e.target.value)}
                    >
                        <option value="">Tất cả chi nhánh</option>
                        {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>

                <div className={styles.filterItem}>
                    <label>Rạp</label>
                    <select
                        value={filters.cinema}
                        onChange={(e) => onFilterChange('cinema', e.target.value)}
                    >
                        <option value="">Tất cả rạp</option>
                        {cinemas?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className={styles.filterItem}>
                    <label>Ngày</label>
                    <input
                        type="date"
                        value={filters.date}
                        onChange={(e) => onFilterChange('date', e.target.value)}
                    />
                </div>

                <div className={styles.filterItem}>
                    <label>Trạng thái</label>
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="pending">Chờ thanh toán</option>
                        <option value="failed">Thất bại</option>
                    </select>
                </div>

                <div className={styles.filterItem}>
                    <label>Phim</label>
                    <select
                        value={filters.movie}
                        onChange={(e) => onFilterChange('movie', e.target.value)}
                    >
                        <option value="">Tất cả phim</option>
                        {movies?.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                </div>
            </div>

            {/* Hàng 2: Thanh tìm kiếm */}
            <div className={styles.searchWrapper}>
                <div className={styles.searchInner}>
                    <Search className={styles.searchIcon} size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
                        value={filters.search}
                        onChange={(e) => onFilterChange('search', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default TicketFilterBar;