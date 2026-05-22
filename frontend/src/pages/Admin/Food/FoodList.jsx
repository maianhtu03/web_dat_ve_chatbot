import React from 'react';
import AdminFoodTable from '../../../features/Foods/Admin/AdminFoodTable';
import styles from './FoodList.module.css';

const FoodList = () => {
    return (
        <div className={styles.foodListPage}>
            <div className={styles.pageHeader}>
                <div className={styles.breadcrumb}>
                    <span>Quản lý</span>
                    <span className={styles.separator}> &gt; </span>
                    <span className={styles.current}>Quản lý đồ ăn</span>
                </div>
                <h3 className={styles.title}>QUẢN LÝ ĐỒ ĂN</h3>
            </div>

            <div className={styles.contentCard}>
                <AdminFoodTable />
            </div>
        </div>
    );
};

export default FoodList;