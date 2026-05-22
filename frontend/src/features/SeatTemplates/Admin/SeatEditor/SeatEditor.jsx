import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './SeatEditor.module.css';
import normalSeatIcon from '../../../../assets/images/seat-unselect-normal.png';
import vipSeatIcon from '../../../../assets/images/seat-unselect-vip.png';
import coupleSeatIcon from '../../../../assets/images/seat-unselect-double.png';
import SuccessModal from './SuccessModal';

const SeatEditor = () => {
    const { id } = useParams();
    const [template, setTemplate] = useState(null);
    const [seats, setSeats] = useState([]);
    const [isPublished, setIsPublished] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/seat-templates/${id}`);
                setTemplate(res.data);
                setSeats(res.data.seats || []);
                setIsPublished(res.data.status === 'published');
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu sơ đồ:", error);
            }
        };
        loadData();
    }, [id]);

    // --- LOGIC GỘP GHẾ & TÍNH TỔNG (ĐÃ SỬA ĐỂ ẨN GHẾ LẺ VÀ TRỪ TỔNG) ---
    const { groupedSeats, totalSeats } = useMemo(() => {
        const rows = {};
        // Nhóm ghế theo hàng
        seats.forEach(seat => {
            if (!rows[seat.row_label]) rows[seat.row_label] = [];
            rows[seat.row_label].push(seat);
        });

        const finalGroups = {};
        let seatCount = 0; // Biến đếm tổng số ghế hợp lệ

        Object.entries(rows).forEach(([label, rowSeats]) => {
            const newRow = [];
            let activeCounter = 1; // Số thứ tự hiển thị (A1, A2...)

            for (let i = 0; i < rowSeats.length; i++) {
                const current = rowSeats[i];
                const next = rowSeats[i + 1];

                // 1. Nếu là Cặp Ghế Đôi (Couple) hợp lệ
                if (current.type === 'couple' && next && next.type === 'couple') {
                    newRow.push({
                        ...current,
                        isBetaCouple: true,
                        displayLabel: isPublished
                            ? `${label}${activeCounter}-${label}${activeCounter + 1}`
                            : `${label}${current.seat_number}-${label}${next.seat_number}`,
                        partnerId: next.id
                    });

                    // Chỉ cộng vào tổng nếu ghế không ở trạng thái ẩn
                    if (current.status !== 'hidden') {
                        seatCount += 2;
                        activeCounter += 2;
                    }
                    i++; // Bỏ qua ghế đối tác đã gộp
                }
                // 2. Nếu là Ghế Đơn (Normal/VIP)
                else if (current.type !== 'couple') {
                    newRow.push({
                        ...current,
                        isBetaCouple: false,
                        displayLabel: isPublished
                            ? `${label}${activeCounter}`
                            : `${label}${current.seat_number}`
                    });

                    if (current.status !== 'hidden') {
                        seatCount += 1;
                        activeCounter += 1;
                    }
                }
                // 3. XỬ LÝ GHẾ ĐÔI BỊ LẺ (VD: hàng 11 ghế nhưng là ghế đôi)
                else {
                    // KHÔNG push vào newRow -> Ghế lẻ này sẽ biến mất khỏi giao diện
                    // KHÔNG cộng vào seatCount -> Tổng số ghế tự động trừ đi ghế này
                    console.warn(`Đã ẩn ghế lẻ không hợp lệ tại vị trí: ${label}${current.seat_number}`);
                }
            }
            finalGroups[label] = newRow;
        });

        return { groupedSeats: finalGroups, totalSeats: seatCount };
    }, [seats, isPublished]);

    const handlePublish = async () => {
        try {
            await axios.put(`http://localhost:5000/api/seat-templates/${id}`, {
                ...template,
                status: 'published',
                capacity: totalSeats
            });
            setIsPublished(true);
            setShowSuccessModal(true);
        } catch (error) {
            console.error("Chi tiết lỗi:", error.response?.data);
            alert("Lỗi khi xuất bản: " + (error.response?.data?.message || "Lỗi server"));
        }
    };

    const toggleSeatStatus = async (seat) => {
        const newStatus = seat.status === 'active' ? 'hidden' : 'active';
        const targetIds = seat.isBetaCouple ? [seat.id, seat.partnerId] : [seat.id];
        try {
            await Promise.all(targetIds.map(sid =>
                axios.put(`http://localhost:5000/api/seat-templates/seats/${sid}`, { status: newStatus })
            ));
            setSeats(prev => prev.map(s => targetIds.includes(s.id) ? { ...s, status: newStatus } : s));
            setTemplate(prev => ({
                ...prev,
                capacity: seat.status === 'active'
                    ? prev.capacity - targetIds.length
                    : prev.capacity + targetIds.length
            }));
        } catch {
            alert("Không thể cập nhật trạng thái ghế");
        }
    };

    const toggleRowStatus = async (rowLabel, targetStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/seat-templates/rows/${id}/${rowLabel}`, { status: targetStatus });
            setSeats(prev => prev.map(s => s.row_label === rowLabel ? { ...s, status: targetStatus } : s));
        } catch {
            alert("Lỗi khi cập nhật trạng thái hàng ghế");
        }
    };

    if (!template) return <div className={styles.loading}>Đang tải dữ liệu...</div>;

    return (
        <div className={styles.editorPage}>
            <h2 className={styles.pageTitle}>Sơ đồ ghế: {template.name}</h2>
            <div className={styles.mainContent}>
                <div className={styles.editorArea}>
                    <div className={styles.screen}>MÀN HÌNH CHIẾU</div>
                    <div className={styles.gridContainer}>
                        <div className={styles.grid}>
                            {!isPublished && (
                                <div className={styles.row}>
                                    <div className={styles.rowLabel}>Row</div>
                                    {[...Array(template.cols_count)].map((_, i) => (
                                        <div key={i} className={styles.colHeader}>{i + 1}</div>
                                    ))}
                                    <div className={styles.actionHeader}>Actions</div>
                                </div>
                            )}
                            {Object.entries(groupedSeats).map(([label, rowSeats]) => (
                                <div key={label} className={styles.row} style={{ justifyContent: 'center' }}>
                                    {!isPublished && <div className={styles.rowLabel}>{label}</div>}
                                    {rowSeats.map((seat) => (
                                        <div
                                            key={seat.id}
                                            className={`
                                                ${styles.seat}
                                                ${styles[seat.type]}
                                                ${seat.status === 'hidden' ? styles.hidden : ''}
                                                ${seat.isBetaCouple ? styles.betaCoupleBlock : ''}
                                                ${isPublished && seat.status === 'hidden' ? styles.publishedHidden : ''}
                                                ${isPublished ? styles.viewMode : ''} 
                                            `}
                                            onClick={() => !isPublished && toggleSeatStatus(seat)}
                                            title={seat.displayLabel}
                                        >
                                            <span className={styles.seatLabel}>
                                                {isPublished
                                                    ? (seat.status === 'active' ? seat.displayLabel : '')
                                                    : (seat.status === 'hidden' ? '+' : '')
                                                }
                                            </span>
                                        </div>
                                    ))}
                                    {!isPublished && (
                                        <div className={styles.rowActions}>
                                            <button className={styles.btnAddRow} onClick={() => toggleRowStatus(label, 'active')}>+</button>
                                            <button className={styles.btnRemoveRow} onClick={() => toggleRowStatus(label, 'hidden')}>-</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={`${styles.sidebar} ${isPublished ? styles.publishedMode : ''}`}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>Xuất Bản</div>
                        <div className={styles.cardBody}>
                            <div className={styles.infoRow}>
                                <span>Trạng Thái:</span>
                                <span className={styles.statusText}>{isPublished ? 'Đã xuất bản' : 'Chưa xuất bản'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span>Hoạt Động:</span>
                                <span className={styles.statusText}>{template.is_active ? 'Mở' : 'Khóa'}</span>
                            </div>
                            <div className={styles.buttonGroup}>
                                {isPublished ? (
                                    <>
                                        <button className={styles.btnSaveDraft} onClick={() => navigate('/admin/seat-templates')}>Danh sách</button>
                                        <button className={styles.btnPublish} onClick={() => setIsPublished(false)}>Cập nhật</button>
                                    </>
                                ) : (
                                    <>
                                        <button className={styles.btnSaveDraft}>Lưu nháp</button>
                                        <button className={styles.btnPublish} onClick={handlePublish}>Xuất Bản</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>Chú Thích</div>
                        <div className={styles.cardBody}>
                            <div className={styles.legendItem}>
                                <span className={styles.legendLabel}>Ghế Thường:</span>
                                <div className={styles.iconBox}>
                                    <div className={`${styles.colorBox} ${styles.normal}`}></div>
                                    <img src={normalSeatIcon} alt="Normal" className={styles.legendIcon} />
                                </div>
                            </div>
                            <div className={styles.legendItem}>
                                <span className={styles.legendLabel}>Ghế VIP:</span>
                                <div className={styles.iconBox}>
                                    <div className={`${styles.colorBox} ${styles.vip}`}></div>
                                    <img src={vipSeatIcon} alt="VIP" className={styles.legendIcon} />
                                </div>
                            </div>
                            <div className={styles.legendItem}>
                                <span className={styles.legendLabel}>Ghế Đôi:</span>
                                <div className={styles.iconBox}>
                                    <div className={`${styles.colorBox} ${styles.couple}`}></div>
                                    <img src={coupleSeatIcon} alt="Couple" className={styles.legendIcon} />
                                </div>
                            </div>
                            <div className={styles.totalSeatsRow}>
                                <span className={styles.legendLabel}>Tổng số ghế:</span>
                                <span className={styles.totalCount}>{totalSeats}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showSuccessModal && <SuccessModal onClose={() => setShowSuccessModal(false)} />}
        </div>
    );
};

export default SeatEditor;