import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './RoomSeatView.module.css';
import RoomStatusSwitch from './RoomStatusSwitch';
import normalSeatIcon from '../../../assets/images/seat-unselect-normal.png';
import vipSeatIcon from '../../../assets/images/seat-unselect-vip.png';
import coupleSeatIcon from '../../../assets/images/seat-unselect-double.png';

const RoomSeatView = ({ roomId: propRoomId, isReadOnly = false }) => {
    const { id: urlId } = useParams();

    // THAY ĐỔI 2: Nếu có roomId từ props (trang suất chiếu) thì dùng, không thì dùng id từ URL
    const id = propRoomId || urlId;
    const navigate = useNavigate();
    const [seats, setSeats] = useState([]);
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Dùng isPublished để đồng bộ logic "Xuất bản/Cập nhật"
    const [isPublished, setIsPublished] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return; // Bảo vệ nếu không có id
            try {
                const roomRes = await axios.get(`http://localhost:5000/api/rooms/${id}`);
                setRoom(roomRes.data);

                // Giả định trạng thái 'published' từ template hoặc chính phòng đó
                // Ở đây ta dùng is_active hoặc một trường status tương ứng
                setIsPublished(roomRes.data.is_active === 1);

                const templateId = roomRes.data.template_id;
                if (templateId) {
                    const seatRes = await axios.get(`http://localhost:5000/api/seat-templates/seats/${templateId}`);
                    setSeats(seatRes.data);
                }
                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleStatusChange = async (newValue) => {
        const statusValue = newValue ? 1 : 0;

        try {
            // --- BƯỚC 1: Nếu người dùng nhấn Xuất bản (newValue = true), hãy lưu ghế hỏng trước ---
            if (newValue === true) {
                const templateId = room.template_id;
                const brokenIds = seats.filter(s => s.is_broken === 1).map(s => s.id);

                await axios.put(`http://localhost:5000/api/seat-templates/${templateId}/broken-seats`, {
                    brokenSeatIds: brokenIds
                });
                console.log("Đã tự động lưu ghế hỏng trước khi xuất bản");
            }

            // --- BƯỚC 2: Cập nhật trạng thái phòng như cũ ---
            const updateData = {
                ...room,
                is_active: statusValue
            };

            await axios.put(`http://localhost:5000/api/rooms/${id}`, updateData);

            setRoom(prev => ({ ...prev, is_active: statusValue }));
            setIsPublished(newValue);

            if (newValue === true) alert("Xuất bản phòng thành công!");
        } catch (error) {
            console.error("Chi tiết lỗi:", error.response?.data);
            alert(error.response?.data?.message || "Lỗi cập nhật!");
        }
    };

    // --- LOGIC GỘP GHẾ ĐÔI ---
    const groupedSeats = useMemo(() => {
        const rows = {};
        seats.forEach(seat => {
            if (!rows[seat.row_label]) rows[seat.row_label] = [];
            rows[seat.row_label].push(seat);
        });

        const finalGroups = {};
        Object.entries(rows).forEach(([label, rowSeats]) => {
            const newRow = [];
            let activeCounter = 1;

            for (let i = 0; i < rowSeats.length; i++) {
                const current = rowSeats[i];
                const next = rowSeats[i + 1];

                if (current.type === 'couple' && next && next.type === 'couple' && i % 2 === 0) {
                    const isCoupleActive = current.status !== 'hidden';
                    newRow.push({
                        ...current,
                        isBetaCouple: true,
                        isExtraOdd: false,
                        displayLabel: `${label}${activeCounter}-${label}${activeCounter + 1}`
                    });
                    if (isCoupleActive) activeCounter += 2;
                    i++;
                } else {
                    const isSeatActive = current.status !== 'hidden';
                    const isOddCouple = current.type === 'couple';
                    newRow.push({
                        ...current,
                        isBetaCouple: false,
                        isExtraOdd: isOddCouple,
                        displayLabel: `${label}${activeCounter}`
                    });
                    if (isSeatActive && !isOddCouple) activeCounter += 1;
                }
            }
            finalGroups[label] = newRow;
        });
        return finalGroups;
    }, [seats]);
    // --- HÀM CLICK CHỌN GHẾ HỎNG ---
    const toggleBrokenSeat = (seatId) => {
        // Chỉ cho phép chỉnh sửa khi đang ở chế độ "Cập nhật" (isPublished === false)
        if (isPublished || isReadOnly) return;

        setSeats(prevSeats =>
            prevSeats.map(seat =>
                seat.id === seatId
                    ? { ...seat, is_broken: seat.is_broken === 1 ? 0 : 1 }
                    : seat
            )
        );
    };
    // --- HÀM GỬI LÊN BACKEND ---
    const handleSaveBrokenSeats = async () => {
        if (!room?.template_id) {
            alert("Lỗi: Không tìm thấy ID mẫu sơ đồ!");
            return;
        }

        try {
            const templateId = room.template_id;
            const brokenIds = seats.filter(s => s.is_broken === 1).map(s => s.id);

            await axios.put(`http://localhost:5000/api/seat-templates/${templateId}/broken-seats`, {
                brokenSeatIds: brokenIds
            });

            alert("Đã lưu danh sách ghế hỏng thành công!");
            // Không nhất thiết phải set setIsPublished(true) ở đây 
            // để Admin có thể tiếp tục chỉnh sửa nếu muốn.
        } catch (error) {
            console.error("Lỗi FE khi lưu ghế hỏng:", error);
            alert("Không thể lưu danh sách ghế hỏng.");
        }
    };

    if (loading) return <div className={styles.loading}>Đang tải sơ đồ ghế...</div>;

    return (
        <div className={`${styles.container} ${isReadOnly ? styles.readOnlyMode : ''}`}>
            <div className={styles.mainLayout}>
                {!isReadOnly && (
                    <div className={styles.header}>

                        <div className={styles.titleInfo}>
                            <h2>Sơ đồ ghế: {room?.name}</h2>
                            <p>{room?.cinema_name} • {room?.room_type}</p>
                        </div>
                    </div>
                )}
                <div className={styles.editorArea}>
                    <div className={styles.screen}>MÀN HÌNH CHIẾU</div>
                    <div className={styles.gridContainer}>
                        <div className={styles.grid}>
                            {Object.entries(groupedSeats).map(([label, rowSeats]) => (
                                <div key={label} className={styles.row}>
                                    {rowSeats.map((seat) => (
                                        <div
                                            key={seat.id}
                                            className={`
                                                ${styles.seat}
                                                ${styles[seat.type]}
                                                ${seat.status === 'hidden' ? styles.publishedHidden : ''}
                                                ${seat.isBetaCouple ? styles.betaCoupleBlock : ''}
                                                ${seat.isExtraOdd ? styles.extraOdd : ''}
                                                ${seat.is_broken === 1 ? styles.isBroken : ''}
                                            `}
                                            onClick={() => toggleBrokenSeat(seat.id)}
                                        >
                                            {seat.is_broken === 1 && <div className={styles.xMark}>X</div>}
                                            {seat.status !== 'hidden' && !seat.isExtraOdd && seat.is_broken !== 1 && (
                                                <span className={styles.seatLabel}>
                                                    {seat.displayLabel}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {!isReadOnly && (
                <div className={styles.sidebar}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>Trạng Thái</div>
                        <div className={styles.cardBody}>
                            {/* 1. Dòng trạng thái Xuất bản giống file kia */}
                            <div className={styles.infoRow}>
                                <span>Trạng Thái:</span>
                                <span className={isPublished ? styles.publishedText : styles.draftText}>
                                    {isPublished ? ' Đã xuất bản' : ' Chưa xuất bản'}
                                </span>
                            </div>

                            {/* 2. Dòng Hoạt động dùng Switch đồng bộ API */}
                            <div className={styles.infoRow}>
                                <strong>Hoạt Động:</strong>
                                <div style={{ flexShrink: 0 }}>
                                    <RoomStatusSwitch
                                        checked={room?.is_active === 1}
                                        onChange={handleStatusChange}
                                    />
                                </div>
                            </div>

                            {/* 3. Nút bấm chuyển đổi chế độ Xuất bản/Cập nhật */}

                            <div className={styles.buttonGroup}>
                                {isPublished ? (
                                    <>
                                        <button className={styles.btnList} onClick={() => navigate('/admin/rooms')}>
                                            Danh sách
                                        </button>
                                        <button className={styles.btnUpdate} onClick={() => setIsPublished(false)}>
                                            Chỉnh sửa
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className={styles.btnSaveDraft}
                                            onClick={handleSaveBrokenSeats}
                                        >
                                            Lưu
                                        </button>
                                        <button className={styles.btnPublish} onClick={() => handleStatusChange(true)}>
                                            Xuất Bản
                                        </button>
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
                                    <img src={normalSeatIcon} alt="Normal" className={styles.legendIcon} />
                                </div>
                            </div>
                            <div className={styles.legendItem}>
                                <span className={styles.legendLabel}>Ghế VIP:</span>
                                <div className={styles.iconBox}>
                                    <img src={vipSeatIcon} alt="VIP" className={styles.legendIcon} />
                                </div>
                            </div>
                            <div className={styles.legendItem}>
                                <span className={styles.legendLabel}>Ghế Đôi:</span>
                                <div className={styles.iconBox}>
                                    <img src={coupleSeatIcon} alt="Couple" className={styles.legendIcon} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomSeatView;