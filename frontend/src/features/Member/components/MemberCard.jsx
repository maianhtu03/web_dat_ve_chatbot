import React, { useState, useEffect } from 'react';
import styles from './MemberCard.module.css';
import memberApi from '../../../api/memberApi';

const MemberCard = () => {
    const [memberData, setMemberData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMemberInfo = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const userId = storedUser?.id || storedUser?.userId;

                if (userId) {
                    // Lấy dữ liệu đã được Backend tính toán sẵn logic reset mốc
                    const data = await memberApi.getMemberInfo(userId);
                    setMemberData(data);
                }
            } catch (error) {
                console.error("Lỗi lấy dữ liệu thành viên:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMemberInfo();
    }, []);

    if (loading) return <div className={styles.loading}>Đang kết nối hệ thống...</div>;

    if (!memberData) {
        return (
            <div className={styles.noMember}>
                <p>Bạn chưa kích hoạt thẻ thành viên MTU.</p>
                <button className={styles.activateBtn} onClick={() => window.location.reload()}> Thử lại </button>
            </div>
        );
    }

    // --- DỮ LIỆU TỪ BACKEND (KHÔNG FIX CỨNG) ---
    const spending = Number(memberData.total_spending) || 0;
    const progress = memberData.progressPercent || 0; // Backend trả về % theo từng chặng
    const remaining = memberData.remainingToNext || 0;
    const nextRankName = memberData.nextRankName || "Cao Cấp";

    // Mốc hiển thị dưới thanh Progress
    const minMstone = memberData.minProgress || 0;
    const maxMstone = memberData.maxProgress || 3000000;

    const accumulatedPoints = Number(memberData.total_points_accumulated) || 0;
    const usedPoints = Number(memberData.used_points) || 0;
    const availablePoints = Number(memberData.current_points) || 0;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('vi-VN');
    };

    return (
        <div className={styles.container}>
            {/* 1. Bảng thông tin chi tiết */}
            <div className={styles.tableWrapper}>
                <table className={styles.memberTable}>
                    <thead>
                        <tr>
                            <th>SỐ THẺ</th>
                            <th>HẠNG THẺ</th>
                            <th>NGÀY KÍCH HOẠT</th>
                            <th>TỔNG CHI TIÊU</th>
                            <th>ĐIỂM TÍCH LŨY</th>
                            <th>ĐIỂM ĐÃ TIÊU</th>
                            <th>ĐIỂM KHẢ DỤNG</th>
                            <th>ĐIỂM SẮP HẾT HẠN</th>
                            <th>NGÀY HẾT HẠN</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className={styles.memberCode}>
                                <strong>{memberData.member_code}</strong> <br />
                                <span className={styles.subText}>(Đang Dùng)</span>
                            </td>
                            <td className={styles.rankBadge}>
                                <span className={styles[`rank${memberData.rank_name}`]}>
                                    {memberData.rank_name?.toUpperCase()}
                                </span>
                            </td>
                            <td>{formatDate(memberData.registration_date)}</td>
                            <td className={styles.boldAmount}>{spending.toLocaleString('vi-VN')} Đ</td>
                            <td>{accumulatedPoints.toLocaleString('vi-VN')}</td>
                            <td>{usedPoints.toLocaleString('vi-VN')}</td>
                            <td className={styles.highlightBlue}>{availablePoints.toLocaleString('vi-VN')}</td>
                            <td>{memberData.expiring_points || 0}</td>
                            <td>{formatDate(memberData.expiry_date)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 2. Thanh tiến trình nâng hạng (Logic Tự Động) */}
            <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                    <p className={styles.progressText}>
                        {remaining > 0 ? (
                            <>Bạn cần tích lũy thêm <span className={styles.amountHighlight}>{remaining.toLocaleString('vi-VN')} Đ</span> để nâng hạng <strong>{nextRankName}</strong></>
                        ) : (
                            <span className={styles.congrats}>Chúc mừng! Bạn đang sở hữu hạng thành viên cao nhất.</span>
                        )}
                    </p>
                </div>

                <div className={styles.progressTrack}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${progress}%` }}
                    >
                        <span className={styles.percentText}>{Math.round(progress)}%</span>
                    </div>
                </div>

                <div className={styles.milestones}>
                    <div className={styles.mStone}>
                        <span>{minMstone.toLocaleString('vi-VN')}</span>
                    </div>
                    <div className={styles.mStone}>
                        <span>{maxMstone.toLocaleString('vi-VN')}</span>
                    </div>
                </div>
            </div>

            {/* 3. Ghi chú chân trang */}
            <div className={styles.footerNote}>
                <p>* Thẻ thành viên có giá trị sử dụng tại tất cả các rạp MTU Cinemas trên toàn quốc.</p>
                <p>* Hệ thống sẽ tự động xét lại hạng thẻ dựa trên chi tiêu khi đến ngày hết hạn.</p>
            </div>
        </div>
    );
};

export default MemberCard;