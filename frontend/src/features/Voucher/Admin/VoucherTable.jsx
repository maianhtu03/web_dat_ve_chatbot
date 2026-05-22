import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import voucherApi from '../../../api/voucherApi';
import { Edit2, Trash2, Search, Plus, Ticket } from 'lucide-react';
import styles from './VoucherTable.module.css';

const VoucherTable = () => {
    const [vouchers, setVouchers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchVouchers = async () => {
        try {
            setLoading(true);
            const res = await voucherApi.getAllVouchers();
            setVouchers(res.data || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách voucher:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const filteredVouchers = vouchers.filter(v =>
        v.voucher_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchTerm.toLowerCase()) // Đổi title thành description cho khớp database
    );

    const handleDelete = async (id) => {
        // Kiểm tra xem ID có tồn tại không trước khi gọi API
        if (!id) {
            alert("Lỗi: Không tìm thấy ID của mã giảm giá này!");
            return;
        }

        if (window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này không?")) {
            try {
                await voucherApi.deleteVoucher(id);
                alert("Xóa thành công!");
                fetchVouchers();
            } catch (error) {
                // Hiển thị lỗi chi tiết từ Server
                const msg = error.response?.data?.message || "Không xác định";
                alert("Lỗi khi xóa: " + msg);
                console.error("Delete Error:", error);
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                    <div className={styles.headerLeft}>
                        <Ticket className={styles.headerIcon} />
                        <h3>Danh sách mã giảm giá</h3>
                    </div>
                    <button
                        className={styles.btnAdd}
                        onClick={() => navigate('/admin/vouchers/add')}
                    >
                        <Plus size={18} /> Thêm voucher mới
                    </button>
                </div>

                <div className={styles.searchBar}>
                    <div className={styles.searchInner}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã voucher, mô tả..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Mã voucher</th>
                                <th>Giảm giá</th>
                                <th>Đơn tối thiểu</th>
                                <th>Thời gian hiệu lực</th>
                                <th>Số lượng</th>
                                <th>Đã dùng</th>
                                <th>Trạng thái</th>
                                <th style={{ textAlign: 'center' }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className={styles.emptyState}>Đang tải dữ liệu...</td>
                                </tr>
                            ) : filteredVouchers.length > 0 ? (
                                filteredVouchers.map((v) => {
                                    // Xác định ID (MySQL thường dùng id, MongoDB dùng _id)
                                    const voucherId = v.id || v._id;

                                    return (
                                        <tr key={voucherId}>
                                            <td className={styles.codeCell}>
                                                <span className={styles.voucherBadge}>{v.voucher_code}</span>
                                            </td>
                                            <td className={styles.discountCell}>
                                                {v.discount_type === 'percent'
                                                    ? <span className={styles.percentText}>{v.discount_value}%</span>
                                                    : <span className={styles.amountText}>{Number(v.discount_value).toLocaleString()}đ</span>}
                                            </td>
                                            <td>{Number(v.min_order_value).toLocaleString()}đ</td>
                                            <td className={styles.timeCol}>
                                                <div className={styles.dateInfo}>
                                                    <span>Từ: {new Date(v.start_date).toLocaleDateString('vi-VN')}</span>
                                                    <span>Đến: {new Date(v.expiry_date).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                            </td>
                                            <td>{v.usage_limit}</td>
                                            <td>
                                                <div className={styles.progressWrapper}>
                                                    <span className={styles.usedNum}>{v.used_count || 0}</span>
                                                    <small>/{v.usage_limit}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={v.is_active ? styles.statusActive : styles.statusInactive}>
                                                    {v.is_active ? "Đang chạy" : "Tạm dừng"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button
                                                        className={styles.btnEdit}
                                                        title="Sửa"
                                                        onClick={() => navigate(`/admin/vouchers/edit/${voucherId}`)}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        className={styles.btnDelete}
                                                        title="Xóa"
                                                        onClick={() => handleDelete(voucherId)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className={styles.emptyState}>
                                        Không tìm thấy dữ liệu voucher nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VoucherTable;