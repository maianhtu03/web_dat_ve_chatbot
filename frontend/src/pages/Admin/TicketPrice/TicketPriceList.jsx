import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PriceForm from "../../../features/Prices/Admin/PriceForm";
import PriceTable from "../../../features/Prices/Admin/PriceTable";
import priceApi from "../../../api/priceApi";
import cinemaApi from "../../../api/cinemaApi";
import styles from "./TicketPriceList.module.css";
import { X } from "lucide-react";

const TicketPriceList = () => {
    const { cinemaId } = useParams();
    const navigate = useNavigate();

    const [cinemas, setCinemas] = useState([]);
    const [selectedCinema, setSelectedCinema] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [surcharges, setSurcharges] = useState([]);
    const [basePrices, setBasePrices] = useState({});
    const [loading, setLoading] = useState(false);

    // 1. Tải danh sách rạp
    useEffect(() => {
        const initData = async () => {
            try {
                setLoading(true);
                const res = await cinemaApi.getAll();
                const listCinemas = res.data || [];
                setCinemas(listCinemas);

                if (cinemaId) {
                    const found = listCinemas.find(c => c.id === parseInt(cinemaId));
                    if (found) setSelectedCinema(found);
                } else {
                    setSelectedCinema(null);
                    setBasePrices({});
                    setSurcharges([]);
                }
            } catch (err) {
                console.error("Không thể tải danh sách rạp:", err);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [cinemaId]);

    // 2. Tải cấu hình giá - ĐÃ SỬA LOGIC NHẬN DATA
    useEffect(() => {
        if (!selectedCinema?.id) {
            setBasePrices({});
            setSurcharges([]);
            return;
        }

        const fetchPriceData = async () => {
            try {
                setLoading(true);
                // 1. GỌI ĐÚNG TÊN HÀM TRONG priceApi.js
                // Lưu ý: Nếu trong priceApi.js bạn để là getByCinemaId thì dùng getByCinemaId
                const res = await priceApi.getByCinemaId(selectedCinema.id);

                // 2. BACKEND TRẢ VỀ: res.data.data là OBJECT { cinema_id, base_prices, ... }
                // Không dùng .find() nữa vì BE đã lọc theo ID cho bạn rồi
                const currentConfig = res.data?.data;

                if (currentConfig && String(currentConfig.cinema_id) === String(selectedCinema.id)) {
                    console.log("Dữ liệu nhận được từ BE:", currentConfig);

                    // 3. MAP MA TRẬN GIÁ SÀN
                    const formattedBasePrices = {};
                    const rawBasePrices = currentConfig.base_prices || [];

                    rawBasePrices.forEach(item => {
                        // Key ghép lại: "T2-T6|Sang"
                        const key = `${item.day_type}|${item.time_slot}`;
                        formattedBasePrices[key] = item.price;
                    });
                    setBasePrices(formattedBasePrices);

                    // 4. MAP PHỤ THU
                    // Backend trả về 'extra_fee', FE cần đảm bảo hiển thị đúng
                    const rawSurcharges = currentConfig.surcharges || [];
                    setSurcharges(rawSurcharges.map(s => ({
                        ...s,
                        extra_fee: Number(s.extra_fee) || 0
                    })));

                } else {
                    // Trường hợp rạp chưa có cấu hình (BE trả về rỗng hoặc id không khớp)
                    setBasePrices({});
                    setSurcharges([]);
                }
            } catch {
                console.warn("Rạp này chưa có cấu hình giá trong DB.");
                setBasePrices({});
                setSurcharges([]);
            } finally {
                setLoading(false);
            }
        };
        fetchPriceData();
    }, [selectedCinema]);

    const handleSaveSurcharge = (newItems) => {
        setSurcharges(prev => [...prev, ...newItems]);
        setIsAdding(false);
    };

    const handleBasePriceChange = (day, slot, value) => {
        setBasePrices(prev => ({
            ...prev,
            [`${day}|${slot}`]: value
        }));
    };

    const handleDeleteSurcharge = (index) => {
        setSurcharges(prev => prev.filter((_, i) => i !== index));
    };

    // 3. Lưu toàn bộ - ĐÃ CHUẨN HÓA TÊN TRƯỜNG GỬI LÊN
    const handleSaveAll = async () => {
        if (!selectedCinema) {
            alert("Vui lòng chọn một rạp trước khi lưu!");
            return;
        }

        const formattedBasePrices = Object.entries(basePrices)
            .filter(([key, price]) => key.includes('|') && price !== "" && price !== null)
            .map(([key, price]) => {
                const [day_type, time_slot] = key.split('|');
                return { day_type, time_slot, price: Number(price) || 0 };
            });

        if (formattedBasePrices.length === 0) {
            alert("Vui lòng nhập ít nhất một mức giá sàn!");
            return;
        }

        const formattedSurcharges = surcharges.map(s => ({
            type: s.type,
            name: s.name,
            // Đảm bảo gửi extra_fee (gạch dưới) cho đồng bộ BE
            extra_fee: Number(s.extra_fee || s.extraFee || 0)
        }));

        const finalData = {
            cinema_id: selectedCinema.id,
            basePrices: formattedBasePrices, // Service BE đang nhận key này
            surcharges: formattedSurcharges
        };

        try {
            setLoading(true);
            await priceApi.saveFullConfig(finalData);
            alert(`Lưu thành công cho rạp ${selectedCinema.name}!`);
            navigate("/admin/ticket-price");
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.error || "Server gặp sự cố"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <div>
                        <h1 className={styles.title}>Thiết Lập Bảng Giá</h1>
                        <p className={styles.subtitle}>
                            Rạp: <strong>{selectedCinema ? selectedCinema.name : "Vui lòng chọn rạp..."}</strong>
                        </p>
                    </div>
                </div>

                <div className={styles.actions}>
                    <select
                        className={styles.cinemaSelect}
                        value={selectedCinema?.id || ""}
                        onChange={(e) => navigate(`/admin/price-rules/${e.target.value}`)}
                        disabled={loading}
                    >
                        <option value="" disabled>-- Chọn rạp thiết lập --</option>
                        {cinemas.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <button
                        className={styles.addBtn}
                        onClick={() => setIsAdding(true)}
                        disabled={!selectedCinema}
                    >
                        + Thêm Phụ Thu
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className={styles.modalOverlay} style={{ display: 'flex' }}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 style={{ margin: 0 }}>Thêm phụ thu mới</h3>
                            <button type="button" className={styles.closeBtn} onClick={() => setIsAdding(false)}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <PriceForm onSave={handleSaveSurcharge} />
                        </div>
                    </div>
                </div>
            )}

            <div className={`${styles.mainGrid} ${loading ? styles.loadingEffect : ""}`}>
                <section className={styles.sectionCard}>
                    <h3 className={styles.sectionTitle}>1. Ma Trận Giá Sàn (VNĐ)</h3>
                    <PriceTable
                        onCellChange={handleBasePriceChange}
                        data={basePrices}
                    />
                </section>

                <section className={styles.sectionCard}>
                    <h3 className={styles.sectionTitle}>2. Các Loại Phụ Thu</h3>
                    <div className={styles.surchargeGrid}>
                        {surcharges.length === 0 ? (
                            <div className={styles.emptyState}>Chưa có phụ thu nào.</div>
                        ) : (
                            surcharges.map((s, idx) => (
                                <div key={idx} className={styles.surchargeCard}>
                                    <div className={styles.surchargeInfo}>
                                        <span className={styles.surchargeTag}>{s.type}</span>
                                        <h4 className={styles.surchargeName}>{s.name}</h4>
                                    </div>
                                    <div className={styles.surchargeRight}>
                                        <div className={styles.surchargeValue}>
                                            {/* SỬA HIỂN THỊ Ở ĐÂY */}
                                            +{Number(s.extra_fee || s.extraFee || 0).toLocaleString()}đ
                                        </div>
                                        <button
                                            className={styles.miniDeleteBtn}
                                            onClick={() => handleDeleteSurcharge(idx)}
                                        >
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            <div className={styles.footer}>
                <div className={styles.actionRow}>
                    <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={() => navigate("/admin/ticket-price")}
                    >
                        Danh sách
                    </button>

                    <button
                        type="button"
                        className={styles.btnPrimary} // Có thể bạn muốn đổi style cho nút Lưu
                        onClick={handleSaveAll}
                        disabled={loading || !selectedCinema}
                    >
                        {loading ? "Đang lưu..." : "Xuất bản"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketPriceList;