import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './Profile.module.css';
import Navbar from '../../components/Layout/Navbar/Navbar';
import Footer from '../../components/Layout/Footer/Footer';
import AccountInfo from './components/AccountInfo';
import MemberCard from './components/MemberCard';
import MovieHistory from './components/MovieHistory';
import Points from './components/Points';
import Vouchers from './components/Vouchers';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('account');
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    // Danh sách cấu hình các Tab
    const tabs = [
        { id: 'account', label: 'THÔNG TIN TÀI KHOẢN' },
        { id: 'card', label: 'THẺ THÀNH VIÊN' },
        { id: 'history', label: 'HÀNH TRÌNH ĐIỆN ẢNH' },
        { id: 'points', label: 'ĐIỂM MTU' },
        { id: 'voucher', label: 'VOUCHER' },
    ];

    // Hàm render nội dung động
    const renderContent = () => {
        switch (activeTab) {
            case 'account': return <AccountInfo />;
            case 'card': return <MemberCard />;
            case 'history': return <MovieHistory />;
            case 'points': return <Points />;
            case 'voucher': return <Vouchers />;
            default: return <AccountInfo />;
        }
    };

    return (
        <>
            <Navbar />
            <div className={styles.profilePage}>
                <div className={styles.container}>
                    {/* 1. Thanh Tab Menu */}
                    <div className={styles.tabHeader}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* 2. Vùng hiển thị nội dung của từng Tab */}
                    <div className={styles.tabContent}>
                        {renderContent()}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Profile;