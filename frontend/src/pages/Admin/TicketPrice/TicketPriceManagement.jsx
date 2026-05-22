import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cinemaApi from "../../../api/cinemaApi";
import priceApi from "../../../api/priceApi";
import { Edit, Trash2 } from "lucide-react";
import styles from "./TicketPriceManagement.module.css";

const TicketPriceManagement = () => {
    const [cinemas, setCinemas] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const cinemaRes = await cinemaApi.getAll();
            const cinemaList = cinemaRes.data || [];

            let configData = [];
            try {
                if (priceApi && typeof priceApi.getAllConfigs === 'function') {
                    const priceRes = await priceApi.getAllConfigs();

                    // SỬA TẠI ĐÂY:
                    // Nếu bạn dùng Axios, priceRes.data là toàn bộ JSON trả về.
                    // Mảng chứa các rạp nằm ở priceRes.data.data
                    if (priceRes.data && priceRes.data.success) {
                        configData = priceRes.data.data || [];
                    } else {
                        configData = priceRes.data || []; // Phòng trường hợp API trả thẳng mảng
                    }
                }
            } catch (err) {
                console.warn("Chưa lấy được cấu hình giá:", err);
            }

            const mergedData = cinemaList.map(cinema => {
                // Đảm bảo configData chắc chắn là mảng trước khi find
                const configInfo = Array.isArray(configData)
                    ? configData.find(cfg => String(cfg.cinema_id) === String(cinema.id))
                    : null;

                const surcharges = configInfo?.surcharges && Array.isArray(configInfo.surcharges)
                    ? configInfo.surcharges.map(s => `${s.name} (+${Number(s.extra_fee).toLocaleString()}đ)`)
                    : [];
                return {
                    ...cinema,
                    isConfigured: !!configInfo,
                    basePrice: configInfo?.base_price || null,
                    surcharges: surcharges
                };
            });

            console.log("Dữ liệu sau khi trộn:", mergedData); // Thêm dòng này để kiểm tra ở Console
            setCinemas(mergedData);
        } catch (err) {
            console.error("Lỗi tổng quát:", err);
            setCinemas([]);
        } finally {
            setLoading(false);
        }
    };
    const handleEditPrice = (cinemaId) => {
        navigate(`/admin/price-rules/${cinemaId}`);
    };
    const handleDelete = async (cinemaId, cinemaName) => {
        if (window.confirm(`Bạn có muốn xóa thiết lập giá của rạp "${cinemaName}"? \n(Rạp sẽ quay về trạng thái chưa cấu hình)`)) {
            try {
                setLoading(true);
                // Gọi API xóa toàn bộ cấu hình theo cinemaId
                await priceApi.deleteFullConfig(cinemaId);

                alert("Đã xóa cấu hình giá thành công!");

                // QUAN TRỌNG: Gọi lại fetchData để cập nhật giao diện thành dấu "--"
                await fetchData();
            } catch (err) {
                console.error("Lỗi xóa cấu hình:", err);
                alert("Không thể xóa cấu hình giá lúc này!");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>DANH SÁCH CẤU HÌNH GIÁ VÉ</h1>
                <button className={styles.createBtn} onClick={() => navigate('/admin/price-rules')}>
                    + Thiết Lập Giá Mới
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>TÊN RẠP</th>
                            <th>GIÁ CƠ BẢN (2D)</th>
                            <th>PHỤ THU</th>
                            <th>HOẠT ĐỘNG</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className={styles.centerText}>Đang tải...</td></tr>
                        ) : (
                            cinemas.map((cinema, index) => (
                                <tr key={cinema.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className={styles.cinemaName}>{cinema.name}</div>
                                        <small className={styles.addressText}>{cinema.address}</small>
                                    </td>
                                    <td>
                                        {cinema.basePrice ? (
                                            <span className={styles.priceText}>
                                                {Number(cinema.basePrice).toLocaleString()} đ
                                            </span>
                                        ) : "--"}
                                    </td>
                                    <td>
                                        <div className={styles.surchargeWrapper}>
                                            {cinema.surcharges && cinema.surcharges.length > 0 ? (
                                                cinema.surcharges.map((s, idx) => (
                                                    <span key={idx} className={styles.surchargeBadge}>
                                                        {s} {/* Kết quả sẽ hiện: Ghế VIP (+20.000đ) */}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className={styles.noneText}>--</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <label className={styles.switch}>
                                            <input type="checkbox" checked={cinema.isConfigured} readOnly />
                                            <span className={styles.slider}></span>
                                        </label>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.editBtn}
                                                onClick={() => handleEditPrice(cinema.id)}
                                                title="Chỉnh sửa"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                className={styles.deleteBtn}
                                                title="Xóa cấu hình"
                                                onClick={() => handleDelete(cinema.id, cinema.name)}
                                                disabled={!cinema.isConfigured} // Vô hiệu hóa nếu chưa có cấu hình
                                                style={{ opacity: cinema.isConfigured ? 1 : 0.5, cursor: cinema.isConfigured ? 'pointer' : 'not-allowed' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TicketPriceManagement;