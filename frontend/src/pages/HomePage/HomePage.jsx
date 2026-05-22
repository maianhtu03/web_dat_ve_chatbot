// src/pages/HomePage/HomePage.jsx
import Navbar from '../../components/Layout/Navbar/Navbar';
import Banner from '../../components/Common/Banner/Banner';
import HomeMovieList from '../../features/Movies/User/HomeMovieList';
import Footer from '../../components/Layout/Footer/Footer';
import styles from './HomePage.module.css';

const HomePage = () => {
    return (
        <div className={styles.wrapper}>
            {/* Gọi Navbar ở đây */}
            <Navbar />
            <Banner />
            <HomeMovieList />
            <Footer />
        </div>
    );
};

export default HomePage;