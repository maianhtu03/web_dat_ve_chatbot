import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Film, MapPin, Ticket, Users, LogOut, Clapperboard, Armchair, LayoutGrid,
    CalendarClock, Banknote, UtensilsCrossed, Soup, Image, TicketPercent, Newspaper,
    BarChart3, PieChart, ShoppingBag, MonitorPlay, Map, UserCheck, ChevronDown, ChevronRight
} from 'lucide-react';
import styles from './AdminLayout.module.css';

const Sidebar = ({ isOpen }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || { role: 'guest', permissions: [] };

    // Quản lý trạng thái đóng/mở các nhóm (Mặc định đóng hết)
    const [openGroups, setOpenGroups] = useState({});

    const toggleGroup = (groupName) => {
        setOpenGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert("Đã đăng xuất tài khoản Admin!");
        navigate('/login');
    };

    // --- GIỮ NGUYÊN DANH SÁCH VÀ TÊN NAME CŨ CỦA BẠN ---
    const dashboardItem = { path: '/admin/dashboard', name: 'Bảng điều khiển', icon: <LayoutDashboard size={20} />, code: 'dashboard' };

    const menuGroups = [
        {
            title: 'Thống kê',
            icon: <BarChart3 size={20} />,
            id: 'stats',
            children: [
                { path: '/admin/statistics/revenue', name: 'Thống kê doanh thu', icon: <BarChart3 size={18} />, code: 'stat_revenue' },
                { path: '/admin/statistics/tickets', name: 'Thống kê vé bán', icon: <PieChart size={18} />, code: 'stat_tickets' },
                { path: '/admin/statistics/combos', name: 'Thống kê Combo', icon: <ShoppingBag size={18} />, code: 'stat_combos' },
                { path: '/admin/statistics/movies', name: 'Thống kê phim', icon: <MonitorPlay size={18} />, code: 'stat_movies' },
                { path: '/admin/statistics/operation', name: 'Thống kê suất & phòng chiếu', icon: <Map size={18} />, code: 'stat_operation' },
            ]
        },
        {
            title: 'Hệ thống rạp',
            icon: <LayoutGrid size={20} />,
            id: 'infrastructure',
            children: [
                { path: '/admin/branches', name: 'Quản lý chi nhánh', icon: <MapPin size={18} />, code: 'manage_branches' },
                { path: '/admin/cinemas', name: 'Quản lý rạp chiếu', icon: <Clapperboard size={18} />, code: 'manage_cinemas' },
                { path: '/admin/rooms', name: 'Quản lý phòng chiếu', icon: <Armchair size={18} />, code: 'manage_rooms' },
                { path: '/admin/seat-templates', name: 'Mẫu sơ đồ ghế', icon: <LayoutGrid size={18} />, code: 'manage_seat_templates' },
            ]
        },
        {
            title: 'Phim và Xuất Chiếu',
            icon: <Film size={20} />,
            id: 'movies_show',
            children: [
                { path: '/admin/movies', name: 'Quản lý phim', icon: <Film size={18} />, code: 'movies' },
                { path: '/admin/showtimes', name: 'Quản lý suất chiếu', icon: <CalendarClock size={18} />, code: 'schedule_movie' },
                { path: '/admin/ticket-price', name: 'Thiết lập bảng giá', icon: <Banknote size={18} />, code: 'price' },
            ]
        },
        {
            title: 'Dịch Vụ và ƯU ĐÃI',
            icon: <ShoppingBag size={20} />,
            id: 'services',
            children: [
                { path: '/admin/foods', name: 'Quản lý đồ ăn', icon: <UtensilsCrossed size={18} />, code: 'food' },
                { path: '/admin/combos', name: 'Quản lý combo', icon: <Soup size={18} />, code: 'buyCombo' },
                { path: '/admin/vouchers', name: 'Quản lý Voucher', icon: <TicketPercent size={18} />, code: 'discount' },
            ]
        },
        {
            title: 'Nội dung',
            icon: <Newspaper size={20} />,
            id: 'content',
            children: [
                { path: '/admin/tickets', name: 'Quản lý vé & Đơn hàng', icon: <Ticket size={18} />, code: 'ticket' },
                { path: '/admin/banners', name: 'Quản lý Banner', icon: <Image size={18} />, code: 'banners' },
                { path: '/admin/articles', name: 'Quản lý bài viết', icon: <Newspaper size={18} />, code: 'feedback' },
            ]
        },
        {
            title: 'Tài Khoản',
            icon: <Users size={20} />,
            id: 'accounts',
            children: [
                { path: '/admin/customers', name: 'Quản lý khách hàng', icon: <UserCheck size={18} />, code: 'user' },
                { path: '/admin/users', name: 'Quản lý nhân viên', icon: <Users size={18} />, code: 'staff' },
            ]
        }
    ];

    // --- GIỮ NGUYÊN LOGIC PHÂN QUYỀN CỦA BẠN ---
    const checkPermission = (itemCode) => {
        if (user.role === 'admin') return true;
        return user.permissions && user.permissions.includes(itemCode);
    };

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarActive : ''}`}>
            <div className={styles.logoArea}>
                <h2>MTU Cinemas</h2>
                <span>(Admin Panel)</span>
            </div>

            <nav className={styles.navMenu}>
                <div className={styles.menuLabel}>MENU</div>

                {/* 1. Render mục Bảng điều khiển (Riêng biệt, không option) */}
                {checkPermission(dashboardItem.code) && (
                    <NavLink
                        to={dashboardItem.path}
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        {dashboardItem.icon}
                        <span>{dashboardItem.name}</span>
                    </NavLink>
                )}

                {/* 2. Render các nhóm gộp (Có option đóng/mở) */}
                {menuGroups.map((group, index) => {
                    // Lọc mục con dựa trên logic phân quyền của bạn
                    const filteredChildren = group.children.filter(child => checkPermission(child.code));

                    // Nếu không có quyền xem mục con nào thì ẩn cả nhóm
                    if (filteredChildren.length === 0) return null;

                    const isOpen = openGroups[group.id];

                    return (
                        <div key={index} className={styles.groupWrapper}>
                            <div className={styles.groupHeader} onClick={() => toggleGroup(group.id)}>
                                <div className={styles.groupTitle}>
                                    {group.icon}
                                    <span>{group.title}</span>
                                </div>
                                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </div>

                            {isOpen && (
                                <div className={styles.childMenu}>
                                    {filteredChildren.map((child, idx) => (
                                        <NavLink
                                            key={idx}
                                            to={child.path}
                                            className={({ isActive }) =>
                                                `${styles.navItem} ${styles.childItem} ${isActive ? styles.active : ''}`
                                            }
                                        >
                                            {child.icon}
                                            <span>{child.name}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            <div className={styles.logoutArea}>
                <button onClick={handleLogout} className={styles.btnLogout}>
                    <LogOut size={20} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;