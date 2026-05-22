import React from 'react';
import styles from './RoomStatusSwitch.module.css';

const RoomStatusSwitch = ({ checked, onChange }) => {
    return (
        <div className={styles.switchContainer}>
            <label className={styles.switch}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <span className={styles.slider}></span>
            </label>
            <span className={styles.label}></span>
        </div>
    );
};

export default RoomStatusSwitch;