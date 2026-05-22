import React from 'react';
import styles from './BranchStatusSwitch.module.css';

const BranchStatusSwitch = ({ isActive, onToggle }) => {
    return (
        <div
            className={`${styles.switchContainer} ${isActive ? styles.active : ''}`}
            onClick={onToggle}
        >
            <div className={styles.circle} />
        </div>
    );
};

export default BranchStatusSwitch;