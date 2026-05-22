import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import voucherApi from '../../../api/voucherApi';
import { ChevronLeft, Save, XCircle, RefreshCw } from 'lucide-react';
import styles from './VoucherForm.module.css';

const generateRandomCode = (length = 8) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const VoucherForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        voucher_code: '',
        title: '',
        description: '',
        discount_type: 'fixed',
        discount_value: '',
        max_discount_amount: '',
        min_order_value: 0,
        usage_limit: 1, // Tổng số lượt sử dụng của hệ thống
        limit_per_user: 1, // GIỚI HẠN MỖI KHÁCH HÀNG
        start_date: '',
        expiry_date: '',
        is_global: 1,
        target_rank: 'All',
        is_active: true
    });

    useEffect(() => {
        if (isEdit) {
            const fetchVoucherDetail = async () => {
                try {
                    const res = await voucherApi.getVoucherById(id);
                    const data = res.data;

                    setFormData({
                        voucher_code: data.voucher_code || '',
                        title: data.title || '',
                        description: data.description || '',
                        discount_type: data.discount_type || 'fixed',
                        discount_value: data.discount_value ?? 0,
                        max_discount_amount: data.max_discount_amount ?? '',
                        min_order_value: data.min_order_value ?? 0,
                        usage_limit: data.usage_limit ?? 1,
                        limit_per_user: data.limit_per_user ?? 1,// Cập nhật từ API
                        start_date: data.start_date ? data.start_date.substring(0, 16) : '',
                        expiry_date: data.expiry_date ? data.expiry_date.substring(0, 16) : '',
                        is_global: data.is_global ?? 1,
                        target_rank: data.target_rank || 'All',
                        is_active: Boolean(data.is_active)
                    });
                } catch {
                    alert("Không tìm thấy thông tin voucher!");
                    navigate('/admin/vouchers');
                }
            };
            fetchVoucherDetail();
        } else {
            setFormData(prev => ({ ...prev, voucher_code: generateRandomCode(8) }));
        }
    }, [id, isEdit, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'is_global') {
            const isPublic = Number(value) === 1;
            setFormData(prev => ({
                ...prev,
                is_global: Number(value),
                voucher_code: isPublic ? generateRandomCode(8) : '',
                target_rank: isPublic ? 'All' : prev.target_rank
            }));
            return;
        }

        // Thêm usage_limit_per_user vào danh sách xử lý số
        const numericFields = ['discount_value', 'usage_limit', 'usage_limit_per_user', 'min_order_value', 'max_discount_amount'];

        if (numericFields.includes(name)) {
            let cleanValue = value.replace(/\D/g, '');
            if (cleanValue.length > 1 && cleanValue.startsWith('0')) {
                cleanValue = cleanValue.replace(/^0+/, '');
            }
            setFormData(prev => ({
                ...prev,
                [name]: cleanValue === '' ? 0 : Number(cleanValue)
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRegenerateCode = () => {
        if (!isEdit && Number(formData.is_global) === 1) {
            setFormData(prev => ({ ...prev, voucher_code: generateRandomCode(8) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (new Date(formData.start_date) >= new Date(formData.expiry_date)) {
            alert("Ngày bắt đầu phải trước ngày hết hạn!");
            return;
        }

        try {
            if (isEdit) {
                await voucherApi.updateVoucher(id, formData);
                alert("Cập nhật mã giảm giá thành công!");
            } else {
                await voucherApi.createVoucher(formData);
                alert("Thêm mã giảm giá mới thành công!");
            }
            navigate('/admin/vouchers');
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || "Không thể thực hiện thao tác"));
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.btnBack} onClick={() => navigate('/admin/vouchers')}>
                    <ChevronLeft size={20} />
                </button>
                <span className={styles.breadcrumb}>
                    <span className={styles.link} onClick={() => navigate('/admin/vouchers')}>
                        Quản lý mã giảm giá
                    </span>
                    {' / '}
                    {isEdit ? `Chỉnh sửa: ${formData.voucher_code}` : 'Thêm mới voucher'}
                </span>
            </div>

            <form onSubmit={handleSubmit} className={styles.mainLayout}>
                <div className={styles.leftColumn}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Thông tin cơ bản</h3>

                        <div className={styles.row}>
                            <div className={styles.inputGroup} style={{ flex: 2 }}>
                                <label>Mã voucher <span className={styles.required}>*</span></label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        name="voucher_code"
                                        value={formData.voucher_code}
                                        placeholder={Number(formData.is_global) === 1 ? "Mã tự động" : "VD: CHAO_MUNG_VIP"}
                                        onChange={handleChange}
                                        required
                                        disabled={isEdit}
                                        style={{ flex: 1 }}
                                    />
                                    {!isEdit && Number(formData.is_global) === 1 && (
                                        <button
                                            type="button"
                                            onClick={handleRegenerateCode}
                                            className={styles.btnActionSmall}
                                            title="Đổi mã khác"
                                        >
                                            <RefreshCw size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* CỘT MỚI: SỐ LƯỢNG TỔNG */}
                            <div className={styles.inputGroup} style={{ flex: 1 }}>
                                <label>Số lượng tổng</label>
                                <input
                                    name="usage_limit"
                                    type="text"
                                    value={formData.usage_limit}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* CỘT MỚI: GIỚI HẠN MỖI KHÁCH */}
                            <div className={styles.inputGroup} style={{ flex: 1 }}>
                                <label>Mỗi khách dùng</label>
                                <input
                                    name="limit_per_user"
                                    type="text"
                                    value={formData.limit_per_user}
                                    placeholder="Vd: 1"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroupFull}>
                            <label>Tiêu đề hiển thị</label>
                            <input
                                name="title"
                                value={formData.title}
                                placeholder="VD: Giảm 50k cho thành viên mới..."
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label>Kiểu giảm giá</label>
                                <select name="discount_type" value={formData.discount_type} onChange={handleChange}>
                                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                                    <option value="percent">Phần trăm (%)</option>
                                </select>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Giá trị giảm <span className={styles.required}>*</span></label>
                                <input
                                    name="discount_value"
                                    type="text"
                                    value={formData.discount_value}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {formData.discount_type === 'percent' && (
                            <div className={styles.inputGroupFull}>
                                <label>Số tiền giảm tối đa (VNĐ)</label>
                                <input
                                    name="max_discount_amount"
                                    type="text"
                                    value={formData.max_discount_amount}
                                    placeholder="Để trống nếu không giới hạn"
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label>Ngày bắt đầu <span className={styles.required}>*</span></label>
                                <input
                                    name="start_date"
                                    type="datetime-local"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Ngày hết hạn <span className={styles.required}>*</span></label>
                                <input
                                    name="expiry_date"
                                    type="datetime-local"
                                    value={formData.expiry_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroupFull}>
                            <label>Mô tả / Điều kiện</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                rows="3"
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.rightColumn}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Đối tượng & Điều kiện</h3>

                        <div className={styles.inputGroup}>
                            <label>Phạm vi áp dụng</label>
                            <select name="is_global" value={formData.is_global} onChange={handleChange}>
                                <option value={1}>Công khai (Tất cả khách)</option>
                                <option value={0}>Riêng tư (Theo hạng)</option>
                            </select>
                        </div>

                        {Number(formData.is_global) === 0 && (
                            <div className={styles.inputGroup}>
                                <label>Dành cho hạng</label>
                                <select name="target_rank" value={formData.target_rank} onChange={handleChange}>
                                    <option value="All">Tất cả hạng</option>
                                    <option value="Standard">Standard</option>
                                    <option value="VIP">VIP</option>
                                    <option value="VVIP">VVIP</option>
                                </select>
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label>Đơn tối thiểu (VNĐ)</label>
                            <input
                                name="min_order_value"
                                type="text"
                                value={formData.min_order_value}
                                onChange={handleChange}
                            />
                        </div>

                        <hr className={styles.divider} />

                        <div className={styles.statusRow}>
                            <span>Kích hoạt</span>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    </div>

                    <div className={styles.stickyActions}>
                        <button type="submit" className={styles.btnSubmit}>
                            <Save size={18} /> {isEdit ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                        <button type="button" className={styles.btnCancel} onClick={() => navigate('/admin/vouchers')}>
                            <XCircle size={18} /> Hủy bỏ
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default VoucherForm;