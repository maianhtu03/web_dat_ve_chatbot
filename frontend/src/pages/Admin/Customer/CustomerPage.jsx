import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import CustomerTable from '../../../features/Customer/Admin/CustomerTable';
import CustomerModal from '../../../features/Customer/Admin/CustomerModal';
import customerApi from '../../../api/customerApi';
import styles from './CustomerPage.module.css';

const CustomerPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    // Trạng thái để quản lý việc đang xử lý cho riêng từng dòng (nút toggle/delete)
    const [processingId, setProcessingId] = useState(null);

    // 1. Hàm lấy danh sách khách hàng
    const fetchCustomers = useCallback(async (query = '') => {
        setLoading(true);
        try {
            const response = await customerApi.getAllCustomers(query);
            if (response.success) {
                setCustomers(response.data);
            } else {
                console.error("API Error:", response.message);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Xử lý Debounce Search (500ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchCustomers(searchTerm);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm, fetchCustomers]);

    // 3. Xử lý mở Modal chỉnh sửa
    const handleEdit = (customer) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    // 4. Xử lý thay đổi trạng thái (Bật/Tắt) - Đã cập nhật chuẩn logic
    const handleToggleStatus = async (customer) => {
        const action = Number(customer.is_active) === 1 ? "khóa" : "mở khóa";
        if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) return;

        setProcessingId(customer.id); // Khóa nút trên giao diện
        try {
            // Backend nhận is_active hiện tại và tự đảo ngược
            const response = await customerApi.updateStatus(customer.id, customer.is_active);

            if (response.success) {
                // Cập nhật state tại chỗ để nút gạt ngay lập tức (không cần đợi fetch lại)
                setCustomers(prev => prev.map(c =>
                    c.id === customer.id ? { ...c, is_active: Number(c.is_active) === 1 ? 0 : 1 } : c
                ));
                console.log(`${action} thành công!`);
            }
        } catch (error) {
            console.error("Lỗi Toggle Status:", error);
            alert("Không thể cập nhật trạng thái. Vui lòng thử lại.");
        } finally {
            setProcessingId(null); // Mở khóa nút
        }
    };

    // 5. Xử lý Lưu thông tin từ Modal
    const handleSave = async (updatedData) => {
        try {
            // updatedData.id là ID người dùng, req.body chứa hạng và điểm
            const response = await customerApi.updateCustomerInfo(updatedData.id, {
                rank_name: updatedData.rank_name, // Chỉnh lại key cho khớp Backend
                current_points: updatedData.current_points
            });

            if (response.success) {
                setIsModalOpen(false);
                setSelectedCustomer(null);
                fetchCustomers(searchTerm); // Refresh dữ liệu để hiển thị hạng mới
            }
        } catch {
            alert("Lỗi: Không thể lưu thay đổi.");
        }
    };

    // 6. Xử lý xóa khách hàng
    const handleDelete = async (id) => {
        if (!window.confirm("CẢNH BÁO: Xóa vĩnh viễn dữ liệu khách hàng này?")) return;

        setProcessingId(id);
        try {
            const response = await customerApi.deleteCustomer(id);
            if (response.success) {
                setCustomers(prev => prev.filter(c => c.id !== id));
            }
        } catch {
            alert("Lỗi khi xóa dữ liệu.");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h2>Quản lý khách hàng</h2>
                    <span className={styles.countBadge}>
                        {loading ? '...' : customers.length} thành viên
                    </span>
                </div>

                <div className={styles.searchBar}>
                    <Search size={18} color="#666" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã, tên, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.contentSection}>
                {loading && customers.length === 0 ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p>Đang tải dữ liệu khách hàng...</p>
                    </div>
                ) : (
                    <CustomerTable
                        data={customers}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        loadingId={processingId} // Truyền ID đang xử lý vào Table
                    />
                )}
            </div>

            {isModalOpen && selectedCustomer && (
                <CustomerModal
                    isOpen={isModalOpen}
                    customer={selectedCustomer}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedCustomer(null);
                    }}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default CustomerPage;