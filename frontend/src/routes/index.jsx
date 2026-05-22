import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage/HomePage';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword';
import AdminLayout from '../components/Layout/AdminLayout/AdminLayout';
import AdminDashboard from '../pages/Admin/Dashboard/AdminDashboard';
import MovieDetail from '../pages/MovieDetail/MovieDetail';
import Payment from "../features/Payment/Payment";

import MovieList from '../pages/Admin/Movie/MovieList';
import AddMovie from '../pages/Admin/Movie/AddMovie';
import EditMovie from '../pages/Admin/Movie/EditMovie';


import BranchList from '../pages/Admin/Branch/BranchList';
import CinemaList from '../pages/Admin/Cinema/CinemaList';
import RoomList from '../pages/Admin/Room/RoomList';
import SeatTemplateList from '../pages/Admin/SeatTemplate/SeatTemplateList';
import SeatEditor from '../features/SeatTemplates/Admin/SeatEditor/SeatEditor';
import RoomSeatView from '../features/Rooms/Admin/RoomSeatView';

import ShowtimeManager from '../pages/Admin/Showtimes/ShowtimeManager';
import AddShowtime from '../pages/Admin/Showtimes/AddShowtime';
import ShowtimeDetail from '../pages/Admin/Showtimes/ShowtimeDetail';
import Booking from '../features/Booking/Booking';
import TicketPriceList from '../pages/Admin/TicketPrice/TicketPriceList';
import TicketPriceManagement from "../pages/Admin/TicketPrice/TicketPriceManagement";
import FoodList from '../pages/Admin/Food/FoodList';
import ComboList from '../pages/Admin/Combo/ComboList';
import PaymentSuccess from '../pages/Payment/PaymentSuccess';
import PaymentFail from '../pages/Payment/PaymentFail';
import TicketManagementPage from '../pages/Admin/TicketManagement/TicketManagementPage';
import TicketDetailPage from '../pages/Admin/TicketManagement/TicketDetailPage';
import BannerForm from '../features/Banner/BannerForm';
import BannerList from '../pages/Admin/Banner/BannerList';
import CinemasPage from '../features/Cinemas/User/CinemasPage';
import Profile from '../features/Member/Profile';
import VoucherManagement from '../pages/Admin/Voucher/VoucherManagement';
import VoucherForm from "../features/Voucher/Admin/VoucherForm";
import ArticleManagement from '../pages/Admin/Article/ArticleManagement';
import ArticleForm from '../features/Article/Admin/ArticleForm';
import NewsPage from '../features/Article/User/NewsPage';
import ArticleDetailPage from '../features/Article/User/ArticleDetailPage';
import MoviesPage from '../features/Movies/User/MoviesPage';
// Thêm import cho trang Giá vé người dùng
import PriceTableUser from '../features/Prices/User/PriceTableUser';
import CinemaDetailPage from '../pages/CinemaDetail/CinemaDetailPage';
import RevenueStatistics from '../pages/Admin/Statistics/Revenue/RevenueStatistics';
import TicketStatistics from '../pages/Admin/Statistics/Ticket/TicketStatistics';
import FoodStatistics from '../pages/Admin/Statistics/Food/FoodStatistics';
import MovieStatistics from '../pages/Admin/Statistics/MovieStatistics/MovieStatistics';
import ShowtimeStatistics from '../pages/Admin/Statistics/ShowtimeStatistics/ShowtimeStatistics';
import CustomerPage from '../pages/Admin/Customer/CustomerPage';
import StaffList from '../pages/Admin/Staff/StaffList';
const AdminRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        return <Navigate to="/login" replace />;
    }
    return children;
};
const AppRoutes = () => {
    return (
        <Routes>
            {/* Trang chủ */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/booking/:id" element={<Booking />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-fail" element={<PaymentFail />} />
            <Route path="/phim" element={<MoviesPage />} />
            <Route path="/rap" element={<CinemasPage />} />
            <Route path="/gia-ve" element={<PriceTableUser />} />
            <Route path="/gia-ve/:theaterId" element={<PriceTableUser />} />
            <Route path="/lich-chieu-theo-rap/:id" element={<CinemaDetailPage />} />
            {/* THÊM DÒNG NÀY: Route dành cho trang chi tiết rạp cụ thể */}
            <Route path="/cinema/:id" element={<CinemasPage />} />
            <Route path="/tin-moi-va-uu-dai" element={<NewsPage />} />
            <Route path="/tin-tuc/:slug" element={<ArticleDetailPage />} />
            <Route path="/thanh-vien" element={<Profile />} />
            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminLayout />
                    </AdminRoute>
                }
            >
                {/* Các trang con sẽ hiện ra ở vị trí <Outlet /> trong AdminLayout */}
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="statistics/revenue" element={<RevenueStatistics />} />
                <Route path="statistics/tickets" element={<TicketStatistics />} />
                <Route path="statistics/operation" element={<ShowtimeStatistics />} />
                // Sửa 'food' thành 'combos'
                <Route path="statistics/combos" element={<FoodStatistics />} />
                <Route path="statistics/movies" element={<MovieStatistics />} />
                <Route path="movies" element={<MovieList />} />
                <Route path="movies/add" element={<AddMovie />} />
                <Route path="movies/edit/:id" element={<EditMovie />} />
                <Route path="showtimes" element={<ShowtimeManager />} />
                <Route path="showtimes/add" element={<AddShowtime />} />
                <Route path="showtimes/edit/:id" element={<AddShowtime />} />

                <Route path="showtimes/:id" element={<ShowtimeDetail />} />

                <Route path="branches" element={<BranchList />} />
                <Route path="cinemas" element={<CinemaList />} />
                <Route path="rooms" element={<RoomList />} />
                <Route path="rooms/seats/:id" element={<RoomSeatView />} />
                <Route path="seat-templates" element={<SeatTemplateList />} />
                <Route path="/admin/seat-template/editor/:id" element={<SeatEditor />} />
                <Route path="/admin/ticket-price" element={<TicketPriceManagement />} />
                <Route path="/admin/ticket-price/edit/:cinemaId" element={<TicketPriceList />} />
                <Route path="price-rules" element={<TicketPriceList />} />
                <Route path="price-rules/:cinemaId" element={<TicketPriceList />} />
                <Route path="foods" element={<FoodList />} />
                <Route path="combos" element={<ComboList />} />
                <Route path="tickets" element={<TicketManagementPage />} />
                <Route path="tickets/:id" element={<TicketDetailPage />} />
                <Route path="banners" element={<BannerList />} />
                <Route path="banners/add" element={<BannerForm />} />
                <Route path="banners/edit/:id" element={<BannerForm />} />
                <Route path="vouchers" element={<VoucherManagement />} />
                <Route path="vouchers/add" element={<VoucherForm />} />
                <Route path="vouchers/edit/:id" element={<VoucherForm />} />
                <Route path="articles" element={<ArticleManagement />} />
                <Route path="articles/add" element={<ArticleForm />} />
                <Route path="articles/edit/:id" element={<ArticleForm />} />
                <Route path="customers" element={<CustomerPage />} />
                {/* <Route path="ticket" element={<div>Trang quản lý vé</div>} /> */}
                <Route path="users" element={<StaffList />} />
            </Route>

            {/* Sau này bạn sẽ thêm các route khác ở đây, ví dụ:
            <Route path="/phim/:slug" element={<MovieDetail />} />
            <Route path="/login" element={<Login />} /> 
            */}
        </Routes>
    );
};

export default AppRoutes;