import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import styles from './BranchList.module.css';// Theo tên file image_97d768.png

import AdminBranchTable from '../../../features/Branches/AdminBranchTable';
import BranchForm from '../../../features/Branches/BranchForm';
import { getBranches, createBranch, updateBranch, updateBranchStatus, deleteBranch } from '../../../api/branchApi';

const BranchList = () => {
    const [branches, setBranches] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentBranch, setCurrentBranch] = useState(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const res = await getBranches();
        setBranches(res.data);
    };

    const handleFormSubmit = async (data) => {
        if (currentBranch) await updateBranch(currentBranch.id, data);
        else await createBranch(data);
        setModalOpen(false);
        loadData();
    };

    const filtered = branches.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>QUẢN LÝ CHI NHÁNH</h1>
                <div className={styles.cardHeader}>
                    <div className={styles.searchBar}>
                        <Search size={18} />
                        <input placeholder="Tìm kiếm..." onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button className={styles.addBtn} onClick={() => { setCurrentBranch(null); setModalOpen(true); }}>
                        <Plus size={18} /> Thêm mới
                    </button>
                </div>
            </div>
            <AdminBranchTable
                branches={filtered}
                onEdit={(b) => { setCurrentBranch(b); setModalOpen(true); }}
                onDelete={async (id) => { if (window.confirm("Xóa?")) { await deleteBranch(id); loadData(); } }}
                onToggleStatus={async (id, s) => { await updateBranchStatus(id, s === 1 ? 0 : 1); loadData(); }}
            />

            <BranchForm
                key={currentBranch ? currentBranch.id : 'new'} // Cực kỳ quan trọng để reset form
                isOpen={isModalOpen}
                initialData={currentBranch}
                onClose={() => setModalOpen(false)}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
};

export default BranchList;