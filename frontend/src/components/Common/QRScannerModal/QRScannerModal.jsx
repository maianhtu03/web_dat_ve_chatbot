import React, { useEffect, useRef } from 'react'; // Thêm useRef
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import styles from './QRScannerModal.module.css';
import { X } from 'lucide-react';

const QRScannerModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const scannerRef = useRef(null); // Dùng Ref để quản lý instance scanner

    useEffect(() => {
        if (!isOpen) return;

        // Khởi tạo scanner
        const scanner = new Html5QrcodeScanner("reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: undefined, // Nên để 1.0 cho khung vuông
            showTorchButtonIfSupported: true, // Thêm nút bật đèn pin nếu dùng điện thoại test
        }, false); // verbose = false

        scannerRef.current = scanner;

        const onScanSuccess = async (decodedText) => {
            console.log("Quét thành công:", decodedText);

            // 1. Dừng scanner trước khi chuyển trang
            try {
                if (scannerRef.current) {
                    await scannerRef.current.clear();
                    scannerRef.current = null;
                }
                // 2. Đóng modal
                onClose();
                // 3. Điều hướng - Đảm bảo decodedText là ID (ví dụ: "10")
                navigate(`/admin/tickets/${decodedText}`);
            } catch (error) {
                console.error("Lỗi khi dọn dẹp scanner:", error);
                // Nếu lỗi vẫn chuyển trang để không làm gián đoạn trải nghiệm
                onClose();
                navigate(`/admin/tickets/${decodedText}`);
            }
        };

        const onScanFailure = () => {
            // Thư viện gọi hàm này liên tục khi không thấy QR, tốt nhất để trống
        };

        scanner.render(onScanSuccess, onScanFailure);

        // Cleanup function
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Cleanup error:", err));
                scannerRef.current = null;
            }
        };
    }, [isOpen, navigate, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Quét mã vé khách hàng</h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {/* QUAN TRỌNG: Div này phải luôn tồn tại khi isOpen = true */}
                    <div id="reader" style={{ width: '100%' }}></div>
                    <p className={styles.hint}>Vui lòng đưa mã QR trong email của khách hàng vào khung hình</p>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.stopBtn} onClick={onClose}>
                        Hủy bỏ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRScannerModal;