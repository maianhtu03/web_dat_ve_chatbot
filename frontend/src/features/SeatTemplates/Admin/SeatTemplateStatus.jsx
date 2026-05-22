import React from 'react';
import styles from './SeatTemplateStatus.module.css';

const SeatTemplateStatus = ({ status }) => {
    // Nếu status truyền vào là số 1 hoặc true thì coi là đã xuất bản
    const isPublished = status === 1 || status === true || status === 'Đã xuất bản';

    return (
        <span className={`${styles.statusBadge} ${isPublished ? styles.statusPublished : styles.statusDraft}`}>
            {isPublished ? 'Đã xuất bản' : 'Bản nháp'}
        </span>
    );
};

export default SeatTemplateStatus;