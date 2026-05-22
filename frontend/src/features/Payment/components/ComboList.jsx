import React, { useState, useEffect } from 'react';
import { Plus, Minus, Ticket, Loader2 } from 'lucide-react';
import comboApi from '../../../api/comboApi';
import styles from './ComboList.module.css';

const ComboList = ({ onComboChange }) => {
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCombos = async () => {
            try {
                const res = await comboApi.getAll();
                if (res && res.success) {
                    const data = res.data.map(item => ({
                        ...item,
                        // Gán sale_price vào trường price để các logic cũ không bị hỏng
                        price: Number(item.sale_price) || 0,
                        quantity: 0
                    }));
                    setCombos(data);
                }
            } catch (error) {
                console.error("Lỗi fetch combo:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCombos();
    }, []);

    const handleQtyChange = (id, delta) => {
        const newCombos = combos.map(c => {
            if (c.id === id) {
                const newQty = Math.max(0, c.quantity + delta);
                return { ...c, quantity: newQty };
            }
            return c;
        });
        setCombos(newCombos);

        if (onComboChange) {
            onComboChange(newCombos.filter(c => c.quantity > 0));
        }
    };

    if (loading) return <div className={styles.loading}><Loader2 className={styles.spin} /></div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Ticket size={20} color="#00355a" />
                <h3>COMBO ƯU ĐÃI</h3>
            </div>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.thName}>Tên Combo</th>
                        <th className={styles.thDesc}>Mô tả</th>
                        <th className={styles.thQty}>Số lượng</th>
                    </tr>
                </thead>
                <tbody>
                    {combos.map((combo) => (
                        <tr key={combo.id}>
                            <td className={styles.nameCol}>
                                <div className={styles.comboInfo}>
                                    <img
                                        src={`http://localhost:5000${combo.image}`}
                                        alt={combo.name}
                                        className={styles.comboImg}
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/80'}
                                    />
                                    <span className={styles.comboNameText}>{combo.name}</span>
                                </div>
                            </td>
                            <td className={styles.descCol}>
                                <div className={styles.descContent}>
                                    <p className={styles.description}>{combo.description}</p>
                                    <span className={styles.price}>
                                        {Number(combo.sale_price).toLocaleString('vi-VN')} đ
                                    </span>
                                </div>
                            </td>
                            <td className={styles.qtyCol}>
                                <div className={styles.qtyGroup}>
                                    <button onClick={() => handleQtyChange(combo.id, -1)} className={styles.btnMinus}>
                                        <Minus size={14} />
                                    </button>
                                    <span className={styles.qtyText}>{combo.quantity}</span>
                                    <button onClick={() => handleQtyChange(combo.id, 1)} className={styles.btnPlus}>
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ComboList;