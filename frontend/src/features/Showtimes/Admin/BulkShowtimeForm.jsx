import React, { useState, useEffect, useMemo } from 'react';
import styles from './ShowtimeForm.module.css';

const BulkShowtimeForm = ({
    formData,
    setFormData,
    isAuto,
    setIsAuto,
    handleDayChange,
    selectedMovie,
    calculateEndTimeLocal,
    existingShowtimes,
    findOverlap
}) => {
    const [tempTime, setTempTime] = useState('');
    const currentTempEnd = calculateEndTimeLocal(tempTime, selectedMovie?.duration);

    // --- LOGIC HỖ TRỢ ---
    // Xác định các Thứ thực tế có xuất hiện trong khoảng ngày đã chọn
    const availableDaysInRange = useMemo(() => {
        if (!formData.start_date || !formData.end_date) return new Set();
        const start = new Date(formData.start_date);
        const end = new Date(formData.end_date);
        const days = new Set();
        let current = new Date(start);

        while (current <= end) {
            days.add(current.getDay());
            current.setDate(current.getDate() + 1);
        }
        return days;
    }, [formData.start_date, formData.end_date]);

    // --- TỰ ĐỘNG CẬP NHẬT KHI ĐỔI NGÀY ---
    useEffect(() => {
        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);

            if (start > end) return;

            // Chỉ lấy các thứ nằm trong khoảng ngày
            const autoDays = Array.from(availableDaysInRange);

            setFormData(prev => ({
                ...prev,
                // Tự động chọn tất cả các thứ hợp lệ trong khoảng mới
                days_of_week: autoDays
            }));
        }
    }, [formData.start_date, formData.end_date, availableDaysInRange, setFormData]);

    const isCurrentInputConflict = tempTime && formData.days_of_week.some(day => {
        return (existingShowtimes || []).some(item => {
            const itemDay = new Date(item.show_date).getDay();
            if (itemDay !== day) return false;
            return findOverlap(tempTime, currentTempEnd.raw, currentTempEnd.isNextDay, [item], item.show_date);
        });
    });

    const handleAddTime = () => {
        if (!tempTime || !selectedMovie) {
            alert("Vui lòng chọn phim và giờ bắt đầu!");
            return;
        }

        const result = calculateEndTimeLocal(tempTime, selectedMovie.duration);

        if (formData.start_times.some(t => t.start === tempTime)) {
            alert("Giờ này đã có trong danh sách!");
            return;
        }
        const isOverlapWithTags = formData.start_times.some(t => {
            const isNotOverlapping = (tempTime >= t.rawEnd) || (result.raw <= t.start);
            return !isNotOverlapping;
        });

        if (isOverlapWithTags) {
            alert("BỊ TRÙNG: Khung giờ này chồng lấn với một suất chiếu khác trong danh sách bạn đã chọn!");
            return;
        }

        const overlapDB = formData.days_of_week.some(day => {
            return (existingShowtimes || []).some(item => {
                const itemDay = new Date(item.show_date).getDay();
                if (itemDay !== day) return false;
                return findOverlap(tempTime, result.raw, result.isNextDay, [item], item.show_date);
            });
        });

        if (overlapDB) {
            alert(`BỊ TRÙNG: Giờ ${tempTime} bị chồng chéo với lịch của một trong các ngày đã chọn.`);
            return;
        }

        setFormData({
            ...formData,
            start_times: [
                ...formData.start_times,
                {
                    start: tempTime,
                    end: result.formatted,
                    rawEnd: result.raw,
                    isNextDay: result.isNextDay
                }
            ].sort((a, b) => a.start.localeCompare(b.start))
        });

        setTempTime('');
    };

    return (
        <div className={styles.tabContent}>
            {/* CHỌN KHOẢNG NGÀY */}
            <div className={styles.row}>
                <div className={styles.formGroup}>
                    <label>Từ ngày</label>
                    <input
                        type="date"
                        required
                        value={formData.start_date || ''}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Đến ngày</label>
                    <input
                        type="date"
                        required
                        value={formData.end_date || ''}
                        min={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                </div>
            </div>

            {/* CHỌN THỨ TRONG TUẦN */}
            <label className={styles.labelTitle}>Chọn thứ trong tuần (Chỉ khả dụng trong khoảng ngày)</label>
            <div className={styles.daysGrid}>
                {[1, 2, 3, 4, 5, 6, 0].map(day => {
                    const isDisabled = !availableDaysInRange.has(day);
                    const isActive = formData.days_of_week.includes(day);

                    return (
                        <label
                            key={day}
                            className={`
                                ${styles.checkboxLabel} 
                                ${isActive ? styles.activeDay : ''} 
                                ${isDisabled ? styles.disabledDay : ''}
                            `}
                            style={{
                                opacity: isDisabled ? 0.4 : 1,
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                pointerEvents: isDisabled ? 'none' : 'auto'
                            }}
                        >
                            <input
                                type="checkbox"
                                hidden
                                disabled={isDisabled}
                                checked={isActive}
                                onChange={() => handleDayChange(day)}
                            />
                            <span>{day === 0 ? 'CN' : `T${day + 1}`}</span>
                        </label>
                    );
                })}
            </div>

            <div className={styles.autoCheckRow} style={{ marginTop: '15px' }}>
                <input
                    type="checkbox"
                    id="auto_gen_multiple"
                    checked={isAuto}
                    onChange={(e) => setIsAuto(e.target.checked)}
                />
                <label htmlFor="auto_gen_multiple">Tự động lấp đầy suất chiếu cho các ngày đã chọn</label>
            </div>

            {isAuto ? (
                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>Giờ Mở Cửa</label>
                        <input
                            type="time"
                            value={formData.start_time}
                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Giờ Đóng Cửa</label>
                        <input
                            type="time"
                            value={formData.end_time}
                            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                            required
                        />
                    </div>
                </div>
            ) : (
                <div className={styles.manualEntrySection}>
                    <label className={styles.labelTitle}>Khung giờ chiếu cố định hàng ngày</label>
                    <div className={styles.rowInlineCustom}>
                        <div className={styles.formGroupNoMargin}>
                            <label>Giờ bắt đầu</label>
                            <input
                                type="time"
                                value={tempTime}
                                onChange={(e) => setTempTime(e.target.value)}
                                className={isCurrentInputConflict ? styles.inputError : ''}
                            />
                        </div>
                        <div className={styles.formGroupNoMargin}>
                            <label>Giờ Kết Thúc (Dự kiến)</label>
                            <input
                                type="time"
                                disabled
                                className={styles.disabledInput}
                                value={tempTime && selectedMovie ? calculateEndTimeLocal(tempTime, selectedMovie.duration).raw : ""}
                            />
                        </div>
                        <button type="button" className={styles.btnAddTime} onClick={handleAddTime}>
                            Thêm giờ
                        </button>
                    </div>

                    {formData.start_times.length > 0 && (
                        <div className={styles.manualTags}>
                            {formData.start_times.map((t, idx) => (
                                <div key={idx} className={styles.timeTag}>
                                    <div className={styles.tagTimeInfo}>
                                        <span className={styles.startTime}>{t.start}</span>
                                        <span className={styles.separator}>→</span>
                                        <span className={styles.endTime} style={{ color: t.isNextDay ? '#e67e22' : 'inherit' }}>
                                            {t.end}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.btnRemoveTag}
                                        onClick={() => {
                                            const newTimes = formData.start_times.filter((_, i) => i !== idx);
                                            setFormData({ ...formData, start_times: newTimes });
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BulkShowtimeForm;