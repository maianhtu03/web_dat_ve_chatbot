import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SideBarLayout from "../../../components/Layout/SideBarLayout/SideBarLayout";
import styles from './CinemasPage.module.css';

const CinemasPage = () => {
    const { id } = useParams(); // Lấy ID rạp từ URL
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const BASE_URL = "http://localhost:5000";

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const endpoint = id ? `${BASE_URL}/api/cinemas/${id}` : `${BASE_URL}/api/cinemas`;
                const res = await axios.get(endpoint);
                setData(res.data);
            } catch (error) {
                console.error("Lỗi lấy dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <SideBarLayout><div className={styles.loading}>Đang tải...</div></SideBarLayout>;

    return (
        <SideBarLayout>
            <div className={styles.container}>
                {id && data && !Array.isArray(data) ? (
                    /* --- GIAO DIỆN CHI TIẾT 1 RẠP --- */
                    <div className={styles.detailView}>
                        <h1 className={styles.mainTitle}>{data.name}</h1>

                        <div className={styles.bannerWrapper}>
                            <img
                                src={`${BASE_URL}${data.image_url}`}
                                alt={data.name}
                                className={styles.fullBanner}
                            />
                        </div>

                        <div className={styles.contentSection}>
                            <div className={styles.metaInfo}>
                                <p><i className="fa-solid fa-location-dot"></i> <strong>Địa chỉ:</strong> {data.address}</p>
                                <p><i className="fa-solid fa-phone"></i> <strong>Hotline:</strong> {data.hotline}</p>
                            </div>

                            {/* HIỂN THỊ MÔ TẢ */}
                            {data.description && (
                                <div className={styles.infoBlock}>
                                    <h3 className={styles.subTitle}>Giới thiệu rạp</h3>
                                    <div className={styles.descriptionText}>
                                        {data.description}
                                    </div>
                                </div>
                            )}

                            {/* HIỂN THỊ BẢN ĐỒ (MAP) */}
                            {data.map_iframe && (
                                <div className={styles.infoBlock}>
                                    <h3 className={styles.subTitle}>Vị trí rạp</h3>
                                    <div
                                        className={styles.mapContainer}
                                        dangerouslySetInnerHTML={{ __html: data.map_iframe }}
                                    />
                                </div>
                            )}

                            <button className={styles.backBtn} onClick={() => navigate('/rap')}>
                                <i className="fa-solid fa-chevron-left"></i> XEM TẤT CẢ RẠP
                            </button>
                        </div>
                    </div>
                ) : (
                    /* --- GIAO DIỆN DANH SÁCH RẠP --- */
                    <>
                        <h2 className={styles.title}>HỆ THỐNG RẠP</h2>
                        <div className={styles.grid}>
                            {Array.isArray(data) && data.map((cinema) => (
                                <div key={cinema.id} className={cinema.is_active ? styles.card : styles.cardDisabled} onClick={() => navigate(`/cinema/${cinema.id}`)}>
                                    <div className={styles.imageBox}>
                                        <img src={`${BASE_URL}${cinema.image_url}`} alt={cinema.name} />
                                    </div>
                                    <div className={styles.info}>
                                        <h3>{cinema.name}</h3>
                                        <p><i className="fa-solid fa-location-dot"></i> {cinema.address}</p>
                                        <button className={styles.viewBtn}>Xem chi tiết</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </SideBarLayout>
    );
};

export default CinemasPage;