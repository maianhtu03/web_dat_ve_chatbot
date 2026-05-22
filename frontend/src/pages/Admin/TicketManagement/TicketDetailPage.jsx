import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TicketDetailView from '../../../features/TicketManagement/TicketDetailView';
import styles from './TicketManagement.module.css'; // Dùng chung style header nếu muốn

const TicketDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const childRef = useRef();

    const [isPrinted, setIsPrinted] = useState(false);
    const handlePrintClick = () => {
        if (childRef.current) {
            childRef.current.triggerPrint();
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.detailHeader}>
                <button
                    onClick={() => navigate('/admin/tickets')}
                    className={styles.btnBack}
                >
                    <i className="fa-solid fa-arrow-left"></i> Quay lại danh sách
                </button>
                <h1 className={styles.detailTitle}>Chi tiết vé xem phim</h1>
                <div style={{ width: '120px' }}></div>

                <button
                    onClick={handlePrintClick}
                    className={styles.btnPrint}
                    style={{
                        backgroundColor: isPrinted ? '#a3aed0' : '#3f51b5',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    <i className="fa-solid fa-print"></i> {isPrinted ? 'VÉ ĐÃ IN' : 'IN VÉ'}

                </button>
            </div>

            <TicketDetailView id={id} ref={childRef}
                onDataLoaded={(ticketData) => {
                    // Khi Component Con lấy được data hoặc in xong, nó báo lên đây để cập nhật state
                    setIsPrinted(ticketData.is_printed === 1);
                }}
            />
        </div>
    );
};

export default TicketDetailPage;