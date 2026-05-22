import React, { useEffect, useState, useRef } from 'react';
import { getBranchTree } from '../../../../api/branchApi';
import { socket } from '../../../../utils/socket';
import styles from './LocationSelector.module.css';

const LocationSelector = () => {
    const [branches, setBranches] = useState([]);
    const [hoverBranch, setHoverBranch] = useState(null);
    const [isOpen, setIsOpen] = useState(false); // Thêm state đóng/mở menu
    const dropdownRef = useRef(null); // Để xử lý click ra ngoài thì đóng

    const [selectedCinema, setSelectedCinema] = useState(
        JSON.parse(localStorage.getItem('selectedCinema')) || { name: 'Chọn rạp' }
    );

    // 1. Fetch dữ liệu cây
    useEffect(() => {
        const fetchTree = async () => {
            try {
                const res = await getBranchTree();
                const data = res.data.data;
                setBranches(data);

                // Mặc định hover vào tỉnh của rạp đang chọn hoặc tỉnh đầu tiên
                if (data.length > 0) {
                    const currentBranch = data.find(b =>
                        b.cinemas.some(c => c.id === selectedCinema.id)
                    );
                    setHoverBranch(currentBranch || data[0]);
                }
            } catch (err) {
                console.error("Lỗi fetch chi nhánh:", err);
            }
        };
        fetchTree();
    }, [selectedCinema.id]);

    // 2. Xử lý click ra ngoài để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 3. Hàm chọn rạp
    const handleSelectCinema = (cinema) => {
        setSelectedCinema(cinema);
        localStorage.setItem('selectedCinema', JSON.stringify(cinema));
        socket.emit('user_changed_cinema', cinema);
        setIsOpen(false);

        // Thêm dòng này để toàn bộ App load lại với dữ liệu rạp mới
        window.location.reload();
    };

    return (
        <div className={styles.wrapper} ref={dropdownRef}>
            {/* Click vào header để toggle menu */}
            <div className={styles.header} onClick={() => setIsOpen(!isOpen)}>
                <i className="fa-solid fa-location-dot"></i>
                <span className={styles.currentName}>{selectedCinema.name}</span>
                <i className={`fa-solid fa-chevron-down ${isOpen ? styles.rotate : ''}`}></i>
            </div>

            {/* Menu chỉ hiện khi isOpen là true */}
            <div className={`${styles.dropdown} ${isOpen ? styles.show : ''}`}>
                <div className={styles.branchColumn}>
                    {branches.map(branch => (
                        <div
                            key={branch.id}
                            onMouseEnter={() => setHoverBranch(branch)}
                            className={`${styles.branchItem} ${hoverBranch?.id === branch.id ? styles.activeBranch : ''}`}
                        >
                            <span>{branch.name}</span>
                            <i className="fa-solid fa-chevron-right"></i>
                        </div>
                    ))}
                </div>

                <div className={styles.cinemaColumn}>
                    <p className={styles.columnTitle}>DANH SÁCH RẠP</p>
                    <div className={styles.cinemaList}>
                        {hoverBranch?.cinemas?.map(cinema => (
                            <div
                                key={cinema.id}
                                onClick={() => handleSelectCinema(cinema)}
                                className={`${styles.cinemaItem} ${selectedCinema.id === cinema.id ? styles.activeCinema : ''}`}
                            >
                                {cinema.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationSelector;