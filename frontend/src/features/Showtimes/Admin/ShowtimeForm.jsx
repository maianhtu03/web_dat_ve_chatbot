import React, { useState, useEffect } from 'react';
import showtimeApi from '../../../api/showtimeApi';
import BulkShowtimeForm from './BulkShowtimeForm';
import movieApi from '../../../api/movieApi'; // Giả sử tên file của bạn
import { getBranches } from '../../../api/branchApi';
import { getCinemasByBranch } from '../../../api/cinemaApi';
import { getRoomsByCinema } from '../../../api/roomApi';
import styles from './ShowtimeForm.module.css';
import { useNavigate } from 'react-router-dom';
const ShowtimeForm = ({ type, isEditMode, initialData = {} }) => {
    const [movies, setMovies] = useState([]);
    const [branches, setBranches] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [existingShowtimes, setExistingShowtimes] = useState([]);
    const [isAuto, setIsAuto] = useState(false); // Trạng thái checkbox tự động
    const [manualTimes, setManualTimes] = useState([]);
    // Danh sách giờ thêm thủ công (Queue)
    // Giờ đang nhập ở tab Nhiều ngày
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        movie_id: initialData?.movie_id || '',
        branch_id: initialData?.branch_id || '',
        cinema_id: initialData?.cinema_id || '',
        room_id: initialData?.room_id || '',
        format: initialData?.format || '2D',
        show_date: initialData?.show_date
            ? new Date(initialData.show_date).toLocaleDateString('sv-SE')
            : '',
        start_time: initialData?.start_time?.substring(0, 5) || '',
        end_date: '',
        days_of_week: [],
        start_times: []
    });


    // 1. Tìm phim đang chọn (Đảm bảo dùng đúng tên trường 'versions')
    const selectedMovie = movies.find(m => String(m.id) === String(formData.movie_id));

    // 2. Tách chuỗi versions từ database (ví dụ: "Lồng tiếng, Phụ đề") thành mảng
    const movieVersions = selectedMovie?.versions
        ? (typeof selectedMovie.versions === 'string'
            ? selectedMovie.versions.split(',').map(v => v.trim())
            : selectedMovie.versions)
        : [];

    // Log để kiểm tra thực tế dữ liệu có ra mảng không
    console.log("Dữ liệu versions tách được:", movieVersions);

    // 1. Load danh sách phim và chi nhánh khi component mount
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [movieRes, branchRes] = await Promise.all([
                    movieApi.getAllAdmin(),
                    getBranches()
                ]);
                setMovies(movieRes.data || []);
                setBranches(branchRes.data || []); // Dữ liệu [ {id: 6, name: "Hà Đông"}, ... ]
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            }
        };
        loadInitialData();
    }, []);
    useEffect(() => {
        if (formData.branch_id) {
            const loadCinemas = async () => {
                try {
                    const res = await getCinemasByBranch(formData.branch_id);
                    setCinemas(res.data || []);
                    // Khi đổi chi nhánh, phải xóa rạp và phòng cũ đã chọn
                    setRooms([]);
                    setFormData(prev => ({ ...prev, cinema_id: '', room_id: '' }));
                } catch (error) {
                    console.error("Lỗi tải rạp:", error);
                }
            };
            loadCinemas();
        }
    }, [formData.branch_id]);

    // 3. KHI CHỌN RẠP -> LOAD DANH SÁCH PHÒNG
    useEffect(() => {
        if (formData.cinema_id) {
            const loadRooms = async () => {
                try {
                    const res = await getRoomsByCinema(formData.cinema_id);
                    // Sửa ở đây: res.data là object của axios, .data tiếp theo là object bạn gửi từ back-end
                    setRooms(res.data.data || []);
                } catch {
                    setRooms([]); // Luôn set về mảng rỗng nếu lỗi
                }
            };
            loadRooms();
        }
    }, [formData.cinema_id]);
    // 3. Khi chọn Phòng và Ngày -> Load suất chiếu đang có để hiển thị cột phải
    useEffect(() => {
        console.log(">>> Hook chạy! Dữ liệu hiện tại:", {
            roomId: formData.room_id,
            showDate: formData.show_date,
            start: formData.start_date,
            end: formData.end_date,
            type: type
        });
        const canLoadSingle = type === 'single' && formData.show_date;
        const canLoadBulk = type === 'multiple' && formData.start_date && formData.end_date;

        // Chỉ thực hiện khi có đủ dữ liệu phòng và ngày
        if (formData.room_id && (canLoadSingle || canLoadBulk)) {
            const loadSchedule = async () => {

                try {
                    let res;
                    if (type === 'single') {
                        res = await showtimeApi.getScheduleByRoom(formData.room_id, formData.show_date);
                    } else {
                        // Truyền thêm end_date cho tab Nhiều ngày
                        res = await showtimeApi.getScheduleByRoom(
                            formData.room_id,
                            formData.start_date,
                            formData.end_date
                        );
                    }

                    const allSchedules = res.data || res || [];

                    // Lọc bỏ suất chiếu hiện tại nếu đang ở chế độ Edit
                    let finalData = allSchedules;
                    if (isEditMode && initialData?.id) {
                        finalData = allSchedules.filter(item => String(item.id) !== String(initialData.id));
                    }

                    setExistingShowtimes(finalData);
                } catch (error) {
                    console.error("Lỗi tải lịch phòng:", error);
                    setExistingShowtimes([]);
                }
            };
            loadSchedule();
        } else {
            // Chỉ xóa khi thực sự không đủ điều kiện load (ví dụ chưa chọn phòng)
            setExistingShowtimes([]);
        }
        // Hạn chế tối đa dependency để tránh re-render liên tục
    }, [
        formData.room_id,
        formData.show_date,
        formData.start_date,
        formData.end_date,
        type,
        isEditMode,
        initialData?.id
    ]);
    const handleDayChange = (day) => {
        setFormData(prev => {
            const currentDays = prev.days_of_week || [];
            const newDays = currentDays.includes(day)
                ? currentDays.filter(d => d !== day)
                : [...currentDays, day];
            return { ...prev, days_of_week: newDays };
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- HÀM BỔ TRỢ: Đảm bảo định dạng luôn là HH:mm:ss ---
        const ensureSeconds = (timeStr) => {
            if (!timeStr || typeof timeStr !== 'string') return timeStr;
            // Nếu chỉ có HH:mm (5 ký tự), cộng thêm :00
            return timeStr.length === 5 ? `${timeStr}:00` : timeStr;
        };

        // 1. Giữ nguyên Validation cơ bản
        if (!formData.movie_id || !formData.room_id) {
            alert("Vui lòng chọn phim và phòng chiếu!");
            return;
        }

        // 2. Xử lý lấy danh sách giờ dựa trên CHẾ ĐỘ (Type)
        let finalTimesToSend = [];

        if (type === 'single') {
            // Lấy từ manualTimes và format lại từng phần tử
            finalTimesToSend = manualTimes.map(item => {
                const time = typeof item === 'object' ? item.start : item;
                return ensureSeconds(time);
            });

            // Logic "vớt" giờ đang nhập ở ô input nhưng chưa nhấn nút "Thêm"
            if (!isAuto && formData.start_time) {
                const formattedInputTime = ensureSeconds(formData.start_time);
                if (!finalTimesToSend.includes(formattedInputTime)) {
                    finalTimesToSend.push(formattedInputTime);
                }
            }

            if (!isAuto && finalTimesToSend.length === 0) {
                alert("Vui lòng thêm ít nhất một khung giờ chiếu!");
                return;
            }
        }

        // 3. Tạo Payload thông minh (Đã sửa format thời gian)
        const payload = {
            movie_id: Number(formData.movie_id),
            branch_id: Number(formData.branch_id),
            cinema_id: Number(formData.cinema_id),
            room_id: Number(formData.room_id),
            format: formData.format || '2D',
            status: 'Active',
            duration: selectedMovie?.duration,
            type: type,
            isAuto: isAuto,
        };

        if (type === 'single') {
            payload.show_date = formData.show_date;

            if (isAuto) {
                // Chế độ Auto mới cần start_time/end_time
                payload.start_time = ensureSeconds(formData.start_time);
                payload.end_time = ensureSeconds(formData.end_time);
            } else {
                // Chế độ Thủ công: CHỈ gửi manualTimes, KHÔNG gửi start_time rỗng
                payload.manualTimes = finalTimesToSend;
                // Đảm bảo không gửi start_time: "" lên BE
            }
        }
        else if (type === 'multiple') {
            if (!formData.start_date || !formData.end_date || formData.days_of_week.length === 0) {
                alert("Vui lòng chọn khoảng ngày và các thứ trong tuần!");
                return;
            }

            payload.start_date = formData.start_date;
            payload.end_date = formData.end_date;
            payload.days_of_week = formData.days_of_week; // Mảng [1, 2, 5...]

            if (isAuto) {
                // Chế độ tự động nhiều ngày
                payload.start_time = ensureSeconds(formData.start_time);
                payload.end_time = ensureSeconds(formData.end_time);
            } else {
                // Chế độ thủ công nhiều ngày: Lấy từ mảng start_times (các thẻ Tag)
                if (formData.start_times.length === 0) {
                    alert("Vui lòng thêm ít nhất một khung giờ!");
                    return;
                }
                // Format lại danh sách giờ từ các Tag thành mảng string HH:mm:ss
                payload.manualTimes = formData.start_times.map(t => ensureSeconds(t.start));
            }
        }
        // Kiểm tra cuối cùng: Nếu trường nào rỗng thì xóa hẳn khỏi payload để BE khỏi check nhầm
        if (!payload.start_time) delete payload.start_time;
        if (!payload.end_time) delete payload.end_time;

        console.log("Payload ĐÃ SẠCH:", payload);

        try {
            let response;
            if (initialData?.id) {
                response = await showtimeApi.update(initialData.id, payload);
                alert("Cập nhật thành công!");
            } else {
                if (type === 'multiple') {
                    response = await showtimeApi.createMultiple(payload);
                } else {
                    response = await showtimeApi.create(payload);
                }

                const { successCount, conflicts, message } = response.data;

                if (conflicts && conflicts.length > 0) {
                    const conflictDetails = conflicts.map(c => {
                        // ĐỊNH DẠNG LẠI NGÀY THÁNG TẠI ĐÂY
                        const date = c.show_date ? new Date(c.show_date).toLocaleDateString('vi-VN') : 'N/A';
                        const time = c.start_time ? c.start_time.substring(0, 5) : '??:??';
                        return `- Ngày ${date} lúc ${time}: Trùng lịch`;
                    }).join('\n');

                    alert(`${message}\n\nĐã thêm thành công ${successCount} suất.\nCác suất sau bị trùng nên đã bỏ qua:\n${conflictDetails}`);
                } else {
                    alert(message || `Thành công! Đã thêm ${successCount} suất chiếu.`);
                }
            }
            navigate('/admin/showtimes');
        } catch (error) {
            const serverData = error.response?.data;
            let errorMessage = serverData?.message || "Lỗi hệ thống";
            const conflictList = serverData?.conflicts || serverData?.errors;

            if (conflictList && Array.isArray(conflictList)) {
                const conflictDetails = conflictList.map(c => {
                    // ĐỊNH DẠNG LẠI NGÀY THÁNG TRONG CATCH TƯƠNG TỰ
                    const date = c.show_date ? new Date(c.show_date).toLocaleDateString('vi-VN') : 'N/A';
                    const time = c.start_time ? c.start_time.substring(0, 5) : '??:??';
                    return `- Ngày ${date} lúc ${time}: Trùng lịch`;
                }).join('\n');
                errorMessage = `KHÔNG THỂ THÊM LỊCH CHIẾU\n\nPhát hiện các khung giờ bị trùng sau:\n${conflictDetails}`;
            }
            alert(errorMessage);
        }
    };

    // Hàm tính giờ kết thúc dựa trên giờ bắt đầu và thời lượng phim
    const calculateEndTimeLocal = (startTime, durationInMinutes) => {
        // 1. Kiểm tra đầu vào
        if (!startTime || !durationInMinutes) {
            return { formatted: "", raw: "", isNextDay: false };
        }
        // 2. Cấu hình thời gian dọn dẹp (có thể đưa ra ngoài làm hằng số)
        const CLEAN_UP_TIME = 20;
        // 3. Chuyển đổi giờ bắt đầu sang tổng số phút
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const startTotalMinutes = startHours * 60 + startMinutes;
        // 4. Tính tổng thời gian kết thúc (Bắt đầu + Thời lượng + Dọn dẹp)
        const endTotalMinutes = startTotalMinutes + Number(durationInMinutes) + CLEAN_UP_TIME;
        // 5. Xác định có qua ngày hôm sau hay không (1440 phút = 24 giờ)
        const isNextDay = endTotalMinutes >= 1440;
        // 6. Tính toán giờ và phút kết thúc thực tế (dùng modulo 1440 để reset về 0 nếu qua ngày)
        const normalizedEndMinutes = endTotalMinutes % 1440;
        const endHours = Math.floor(normalizedEndMinutes / 60);
        const endMins = normalizedEndMinutes % 60;
        // 7. Định dạng chuỗi HH:mm
        const timeString = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
        return {
            formatted: isNextDay ? `${timeString} (+1)` : timeString,
            raw: timeString, // Chuỗi HH:mm sạch để so sánh hoặc lưu DB
            isNextDay: isNextDay,
            totalEndMinutes: endTotalMinutes // Trả thêm cái này để hàm findOverlap so sánh cực nhanh
        };
    };
    const generateAutoSchedule = (openTime, closeTime, duration) => {
        if (!openTime || !closeTime || !duration) return [];

        const projectedShowtimes = [];
        let currentStart = openTime;

        // Chuyển giờ đóng cửa ra phút để so sánh cho chính xác
        const [closeH, closeM] = closeTime.split(':').map(Number);
        const closeTotalMinutes = closeH * 60 + closeM;

        // Vòng lặp giả lập: Chạy cho đến khi giờ bắt đầu vượt quá giờ đóng cửa
        while (true) {
            const result = calculateEndTimeLocal(currentStart, duration);

            // Nếu giờ bắt đầu của suất này đã vượt quá giờ đóng cửa rạp thì dừng
            const [currH, currM] = currentStart.split(':').map(Number);
            if (currH * 60 + currM >= closeTotalMinutes) break;

            projectedShowtimes.push({
                start: currentStart,
                end: result.raw,
                isNextDay: result.isNextDay
            });

            // Suất tiếp theo bắt đầu ngay sau khi suất trước kết thúc (đã bao gồm 20p dọn dẹp)
            currentStart = result.raw;

            // Bảo vệ vòng lặp vô hạn (tối đa 20 suất/ngày)
            if (projectedShowtimes.length > 20) break;
        }
        return projectedShowtimes;
    };
    useEffect(() => {
        const loadDependencies = async () => {
            if (isEditMode && initialData) {
                try {
                    // 1. Load rạp
                    if (initialData.branch_id) {
                        const cinemaRes = await getCinemasByBranch(initialData.branch_id);
                        setCinemas(cinemaRes.data || []);
                    }
                    // 2. Load phòng
                    if (initialData.cinema_id) {
                        const roomRes = await getRoomsByCinema(initialData.cinema_id);
                        setRooms(roomRes.data.data || []);
                    }
                    // --- PHẦN THÊM MỚI Ở ĐÂY ---
                    // 3. Khởi tạo giờ chiếu vào danh sách manualTimes để nó hiện thành "tag"
                    if (initialData.start_time && selectedMovie) {
                        const result = calculateEndTimeLocal(
                            initialData.start_time.substring(0, 5),
                            selectedMovie.duration
                        );
                        setManualTimes([{
                            start: initialData.start_time.substring(0, 5),
                            end: result.formatted,
                            rawEnd: result.raw,
                            isNextDay: result.isNextDay
                        }]);
                    }
                    // 4. Cập nhật formData
                    setFormData(prev => ({
                        ...prev,
                        branch_id: initialData.branch_id,
                        cinema_id: initialData.cinema_id,
                        room_id: initialData.room_id,
                        show_date: initialData.show_date
                            ? new Date(initialData.show_date).toLocaleDateString('sv-SE')
                            : ''
                    }));
                } catch (error) {
                    console.error("Lỗi khi load dữ liệu chỉnh sửa:", error);
                }
            }
        };

        loadDependencies();
        // Thêm selectedMovie vào dependency để khi load xong phim thì tính được end_time
    }, [initialData, isEditMode, selectedMovie]);
    // Chuyển thời gian thành số phút tuyệt đối (hỗ trợ xuyên đêm)
    const getAbsoluteMinutes = (timeStr, isNextDay = false) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m + (isNextDay ? 1440 : 0);
    };
    const findOverlap = (newStart, newEndRaw, newIsNextDay, list, targetDate) => {
        if (!list || list.length === 0) return null;

        // 1. Chuyển giờ đang nhập sang tổng số phút
        const nStart = getAbsoluteMinutes(newStart);
        const nEnd = getAbsoluteMinutes(newEndRaw, newIsNextDay);

        return list.find(item => {
            // --- SO SÁNH NGÀY (Không dùng moment) ---
            if (targetDate && item.show_date) {
                // Chuẩn hóa show_date từ DB (thường là ISO string hoặc Date object) về YYYY-MM-DD
                const itemDateStr = new Date(item.show_date).toISOString().split('T')[0];
                const targetDateStr = new Date(targetDate).toISOString().split('T')[0];

                // Nếu khác ngày thì bỏ qua, không so sánh giờ
                if (itemDateStr !== targetDateStr) return false;
            }

            // --- SO SÁNH GIỜ (Dùng các hàm local của bạn) ---
            const sTime = (item.start_time || item.start || "").trim();
            const eTime = (item.end_time || item.rawEnd || item.end || "").trim();
            if (!sTime || !eTime) return false;

            // Lấy 5 ký tự đầu (HH:mm) để tránh lỗi nếu DB có giây (HH:mm:ss)
            const itemStartMin = getAbsoluteMinutes(sTime.substring(0, 5));

            // Tự xác định suất chiếu cũ có qua ngày không nếu DB không lưu biến isNextDay
            let isItemNextDay = item.isNextDay;
            if (isItemNextDay === undefined) {
                const tempEndMin = getAbsoluteMinutes(eTime.substring(0, 5));
                isItemNextDay = tempEndMin <= itemStartMin;
            }

            const itemEndMin = getAbsoluteMinutes(eTime.substring(0, 5), isItemNextDay);

            // Công thức so sánh giao thoa: Max Start < Min End
            return Math.max(nStart, itemStartMin) < Math.min(nEnd, itemEndMin);
        });
    };
    return (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <div className={styles.leftColumn}>
                <div className={styles.card}>
                    <h3>
                        {isEditMode ? "CHỈNH SỬA SUẤT CHIẾU" : `THÊM MỚI SUẤT CHIẾU (${type === 'single' ? 'Theo ngày' : 'Nhiều ngày'})`}
                    </h3>
                    {/* HÀNG 1: CHỌN PHIM & PHIÊN BẢN */}
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Chọn Phim</label>
                            <select
                                value={formData.movie_id}
                                onChange={(e) => setFormData({ ...formData, movie_id: e.target.value })}
                                required
                            >
                                <option value="">-- Chọn phim --</option>
                                {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}

                            </select>
                            {selectedMovie && (
                                <small style={{ color: '#007bff', fontWeight: 'bold', marginTop: '4px', display: 'block' }}>
                                    Thời lượng: {selectedMovie.duration} phút (+ 20p dọn phòng)
                                </small>
                            )}
                        </div>
                        <div className={styles.formGroup}>
                            <label>Phiên bản</label>
                            <select
                                value={formData.format}
                                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                                disabled={!formData.movie_id}
                            >
                                <option value="">-- Chọn phiên bản --</option>
                                {movieVersions.map((v, index) => (
                                    <option key={index} value={v}>{v}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* HÀNG 2: CHI NHÁNH, RẠP, PHÒNG */}
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Chi nhánh</label>
                            <select
                                value={formData.branch_id}
                                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                            >
                                <option value="">-- Chi nhánh --</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Rạp chiếu</label>
                            <select
                                value={formData.cinema_id}
                                onChange={(e) => setFormData({ ...formData, cinema_id: e.target.value })}
                                disabled={!formData.branch_id}
                            >
                                <option value="">-- Rạp --</option>
                                {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Tên phòng</label>
                            <select
                                value={formData.room_id}
                                onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                                disabled={!formData.cinema_id}
                                required
                            >
                                <option value="">-- Phòng --</option>
                                {Array.isArray(rooms) && rooms.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* PHẦN CHỌN NGÀY VÀ GIỜ */}
                    {type === 'single' ? (
                        <div className={styles.tabContent}>
                            {/* HÀNG NGÀY CHIẾU & NÚT THÊM GIỜ */}
                            <div className={styles.inlineRow}>
                                <div className={styles.formGroup} style={{ flex: 1 }}>
                                    <label>Ngày chiếu</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.show_date} // THÊM DÒNG NÀY
                                        onChange={(e) => setFormData({ ...formData, show_date: e.target.value })}
                                    />
                                </div>
                                {/* Chỉ hiện nút Thêm giờ khi KHÔNG check tự động */}
                                {!isAuto && (
                                    <button
                                        type="button"
                                        className={styles.btnAddTask}
                                        onClick={() => {
                                            if (!formData.start_time || !selectedMovie) {
                                                alert("Vui lòng chọn phim và giờ trước khi thêm!");
                                                return;
                                            }
                                            const result = calculateEndTimeLocal(formData.start_time, selectedMovie.duration);
                                            // Kiểm tra trùng DB
                                            const overlapDB = findOverlap(formData.start_time, result.raw, result.isNextDay, existingShowtimes);
                                            if (overlapDB) {
                                                // GỢI Ý THÔNG MINH: Lấy giờ kết thúc của suất bị trùng làm giờ bắt đầu gợi ý
                                                const suggestTime = overlapDB.end_time.substring(0, 5);
                                                alert(`TRÙNG LỊCH: Chồng chéo với phim "${overlapDB.movie_title}".\n\n💡 Gợi ý: Bạn nên bắt đầu từ ${suggestTime} (sau khi suất trước kết thúc).`);
                                                return;
                                            }
                                            // Kiểm tra trùng hàng chờ (manualTimes)
                                            const overlapManual = findOverlap(formData.start_time, result.raw, result.isNextDay, manualTimes);
                                            if (overlapManual) {
                                                alert(`BỊ TRÙNG: Chồng chéo với một suất bạn vừa thêm bên dưới (${overlapManual.start}).`);
                                                return;
                                            }
                                            // Thêm vào hàng chờ
                                            const newShowtime = {
                                                start: formData.start_time,
                                                end: result.formatted,
                                                rawEnd: result.raw,
                                                isNextDay: result.isNextDay
                                            };
                                            setManualTimes([...manualTimes, newShowtime]);
                                            setFormData(prev => ({ ...prev, start_time: '' }));
                                        }}
                                    >
                                        Thêm giờ chiếu
                                    </button>
                                )}
                            </div>
                            {/* CHECKBOX TỰ ĐỘNG */}
                            <div className={styles.autoCheckRow}>

                                <input
                                    type="checkbox"
                                    id="auto_gen"
                                    checked={isAuto}
                                    onChange={(e) => setIsAuto(e.target.checked)}
                                />
                                <label htmlFor="auto_gen">Tự động tạo suất chiếu trong ngày</label>
                            </div>
                            {/* HÀNG GIỜ GIẤC */}
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>{isAuto ? "Giờ Mở Cửa" : "Giờ Chiếu"}</label>
                                    <input
                                        type="time"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>{isAuto ? "Giờ Đóng Cửa" : "Giờ Kết Thúc (Dự kiến + 20p)"}</label>
                                    <input
                                        type="time"
                                        // Nếu tự động: lấy trực tiếp từ formData để người dùng gõ
                                        value={
                                            isAuto
                                                ? (formData.end_time || "")
                                                : (formData.start_time && selectedMovie
                                                    ? calculateEndTimeLocal(formData.start_time, selectedMovie.duration).raw
                                                    : "")
                                        }
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        disabled={!isAuto}
                                        className={!isAuto ? styles.disabledInput : ""}
                                        required={isAuto} // Bắt buộc nhập nếu là tự động
                                    />
                                </div>
                            </div>
                            {/* Danh sách giờ đã thêm thủ công (Hiện dưới dạng tag chuyên nghiệp) */}
                            {!isAuto && manualTimes.length > 0 && (
                                <div className={styles.manualTags}>
                                    {manualTimes.map((t, i) => (
                                        <div key={i} className={styles.timeTag}>
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
                                                onClick={() => setManualTimes(manualTimes.filter((_, index) => index !== i))}
                                                title="Xóa suất này"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <BulkShowtimeForm
                            formData={formData}
                            setFormData={setFormData}
                            isAuto={isAuto}
                            setIsAuto={setIsAuto}
                            handleDayChange={handleDayChange} // Truyền hàm xử lý checkbox thứ xuống
                            selectedMovie={selectedMovie}

                            calculateEndTimeLocal={calculateEndTimeLocal}
                        />
                    )}
                    <div className={styles.actionButtons}>
                        <button
                            type="button"
                            className={styles.btnBack}
                            onClick={() => navigate('/admin/showtimes')} // Thay path bằng route danh sách của bạn
                        >
                            Danh sách
                        </button>
                        <button
                            type="submit"
                            className={styles.btnPublish}
                        >
                            {initialData?.id ? "Lưu thay đổi" : "Xuất bản"}
                        </button>
                    </div>
                </div>
            </div >
            <div className={styles.rightColumn}>
                <div className={styles.card}>
                    <h3>
                        {type === 'single'
                            ? `Lịch đã có ngày ${formData.show_date || ''}`
                            : `Lịch từ ${formData.start_date || '...'} đến ${formData.end_date || '...'}`}
                    </h3>

                    <div className={styles.scheduleList}>
                        {existingShowtimes.length > 0 ? (
                            existingShowtimes.map((item, index) => {
                                const itemDayOfWeek = new Date(item.show_date).getDay();
                                const isDaySelected = type === 'multiple'
                                    ? (formData.days_of_week || []).includes(itemDayOfWeek)
                                    : true;
                                // 1. Xác định mảng giờ cần kiểm tra (Tab đơn: [time], Tab nhiều ngày: start_times)
                                // --- PHẦN SỬA LOGIC XÁC ĐỊNH GIỜ CẦN CHECK ---
                                let timesToCheck = [];
                                if (type === 'multiple') {
                                    if (isAuto) {
                                        // LẤY TOÀN BỘ CÁC SUẤT GIẢ LẬP ĐỂ CHECK
                                        timesToCheck = generateAutoSchedule(
                                            formData.start_time,
                                            formData.end_time,
                                            selectedMovie?.duration
                                        );
                                    } else {
                                        timesToCheck = formData.start_times || [];
                                    }
                                } else {
                                    // TAB THÊM THEO NGÀY (SINGLE)
                                    if (isAuto) {
                                        // NẾU BẬT AUTO: Phải lấy toàn bộ danh sách giả lập để đối soát
                                        timesToCheck = generateAutoSchedule(
                                            formData.start_time,
                                            formData.end_time,
                                            selectedMovie?.duration
                                        );
                                    } else {
                                        // NẾU THỦ CÔNG: Check giờ đang nhập VÀ các giờ đã nằm trong hàng chờ (manualTimes)
                                        timesToCheck = [formData.start_time, ...manualTimes.map(t => t.start)];
                                    }
                                }

                                // 2. Kiểm tra trùng lịch
                                // Thay vì truyền trực tiếp 'time' (bây giờ có thể là Object {start, end...})
                                const isConflict = isDaySelected && timesToCheck.some(time => {
                                    if (!time || !selectedMovie?.duration) return false;

                                    // LỖI Ở ĐÂY: Nếu 'time' là Object, bạn phải dùng 'time.start' 
                                    // hoặc kiểm tra nếu nó là string thì dùng luôn.
                                    const startTimeString = typeof time === 'object' ? time.start : time;

                                    if (!startTimeString) return false; // Phòng hờ dữ liệu trống

                                    const currentInputEnd = calculateEndTimeLocal(startTimeString, selectedMovie.duration);

                                    return findOverlap(
                                        startTimeString,
                                        currentInputEnd.raw,
                                        currentInputEnd.isNextDay,
                                        [item],
                                        item.show_date
                                    );
                                });

                                // Định dạng lại ngày hiển thị cho đẹp
                                const formattedDate = item.show_date ? new Date(item.show_date).toLocaleDateString('vi-VN') : '';

                                return (
                                    <div
                                        key={index}
                                        className={`${styles.scheduleItem} ${isConflict ? styles.conflictHighlight : ''}`}
                                    >
                                        <div className={styles.timeInfo}>
                                            {/* Hiển thị ngày để Admin biết suất này của ngày nào */}
                                            <div className={styles.itemDate} style={{ color: '#666', fontSize: '11px', marginBottom: '2px' }}>
                                                📅 {formattedDate}
                                            </div>
                                            <strong>{item.start_time?.substring(0, 5)}</strong> đến {item.end_time?.substring(0, 5)}
                                        </div>
                                        <div className={styles.movieInfo}>{item.movie_title}</div>

                                        {isConflict && (
                                            <div className={styles.conflictBadge} style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: '12px', marginTop: '4px' }}>
                                                ⚠️ Trùng với giờ đang nhập
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p className={styles.emptyText}>Phòng trống trong khoảng này</p>
                        )}
                    </div>
                </div>
            </div>
        </form >
    );
};

export default ShowtimeForm;
