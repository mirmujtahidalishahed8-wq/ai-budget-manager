import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DebtManager = () => {
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        totalAmount: '',
        remainingAmount: '',
        emiAmount: '',
        dueDate: ''
    });

    const getDebts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/finance/debts', { headers: { 'x-auth-token': token } });
            setDebts(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        getDebts();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Populate form for editing
    const handleEdit = (debt) => {
        setEditMode(true);
        setCurrentId(debt._id);
        const scrollElement = document.getElementById("debt-form");
        if (scrollElement) scrollElement.scrollIntoView({ behavior: "smooth" });

        setFormData({
            name: debt.name,
            totalAmount: debt.totalAmount,
            remainingAmount: debt.remainingAmount,
            emiAmount: debt.emiAmount,
            dueDate: debt.dueDate
        });
    };

    // Cancel edit
    const handleCancel = () => {
        setEditMode(false);
        setCurrentId(null);
        setFormData({ name: '', totalAmount: '', remainingAmount: '', emiAmount: '', dueDate: '' });
    };

    // Handle Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this debt record?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/finance/debts/${id}`, { headers: { 'x-auth-token': token } });
            getDebts();
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            if (editMode && currentId) {
                // UPDATE
                await axios.put(`/api/finance/debts/${currentId}`, formData, { headers: { 'x-auth-token': token } });
                setEditMode(false);
                setCurrentId(null);
            } else {
                // CREATE
                await axios.post('/api/finance/debts', formData, { headers: { 'x-auth-token': token } });
            }

            setFormData({ name: '', totalAmount: '', remainingAmount: '', emiAmount: '', dueDate: '' });
            getDebts();
        } catch (err) {
            console.log(err);
        }
    };

    // Calculate Payoff Time
    const getPayoffTime = (remaining, emi) => {
        if (!emi || emi <= 0) return "N/A";
        const months = Math.ceil(remaining / emi);

        if (months < 12) {
            return `${months} Month${months !== 1 ? 's' : ''}`;
        } else {
            const years = Math.floor(months / 12);
            const remainingMonths = months % 12;
            if (remainingMonths === 0) {
                return `${years} Year${years !== 1 ? 's' : ''}`;
            } else {
                return `${years} Year${years !== 1 ? 's' : ''}, ${remainingMonths} Month${remainingMonths !== 1 ? 's' : ''}`;
            }
        }
    };

    // Icon Styles
    const actionBtnStyle = {
        background: 'rgba(255, 255, 255, 0.05)',
        border: 'none',
        borderRadius: '8px',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        color: 'var(--text-secondary)'
    };

    return (
        <div className="animate-fade-in">
            <div className="text-center" style={{ marginBottom: '30px' }}>
                <h2>Debt Manager</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Face your demons. Pay them off.</p>
            </div>

            <div className="grid">

                {/* Form Card */}
                <div id="debt-form" className="glass-card">
                    <div className="flex-between" style={{ marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>{editMode ? 'Edit Debt Details' : 'Add Loan / Debt'}</h3>
                        {editMode && (
                            <button onClick={handleCancel} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.8rem', borderRadius: '20px' }}>
                                Cancel
                            </button>
                        )}
                    </div>

                    <form onSubmit={onSubmit} className="flex-col">
                        <label className="text-xs">Loan Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="e.g. Student Loan, Credit Card"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                        <div className="flex" style={{ gap: '15px' }}>
                            <div style={{ flex: 1 }}>
                                <label className="text-xs">Total Amount ($)</label>
                                <input
                                    type="number"
                                    name="totalAmount"
                                    placeholder="Total"
                                    value={formData.totalAmount}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="text-xs">Remaining ($)</label>
                                <input
                                    type="number"
                                    name="remainingAmount"
                                    placeholder="Remaining"
                                    value={formData.remainingAmount}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex" style={{ gap: '15px' }}>
                            <div style={{ flex: 1 }}>
                                <label className="text-xs">Monthly EMI ($)</label>
                                <input
                                    type="number"
                                    name="emiAmount"
                                    placeholder="Monthly Pay"
                                    value={formData.emiAmount}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="text-xs">Due Day (1-31)</label>
                                <input
                                    type="number"
                                    name="dueDate"
                                    placeholder="Day"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    required
                                    min="1" max="31"
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-danger" style={{ width: '100%', marginTop: '10px', background: editMode ? 'var(--warning)' : 'var(--danger)', color: editMode ? 'black' : 'white' }}>
                            {editMode ? 'Update Debt Record' : 'Add Debt 💀'}
                        </button>
                    </form>
                </div>

                {/* Debts List */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '20px' }}>Current Liabilities</h3>
                    {loading ? <p>Loading...</p> : (
                        <div className="flex-col">
                            {debts.length > 0 ? debts.map(d => {
                                const progress = ((d.totalAmount - d.remainingAmount) / d.totalAmount) * 100;
                                const payoffTime = getPayoffTime(d.remainingAmount, d.emiAmount);

                                return (
                                    <div key={d._id} style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '16px',
                                        padding: '20px',
                                        border: '1px solid var(--border-color)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div className="flex-between" style={{ marginBottom: '10px' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{d.name}</div>

                                            <div className="flex" style={{ gap: '10px', alignItems: 'center' }}>
                                                <div style={{ color: 'var(--accent-secondary)', fontWeight: 'bold', textAlign: 'right' }}>
                                                    ${d.remainingAmount} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/ ${d.totalAmount}</span>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex" style={{ gap: '6px' }}>
                                                    <button
                                                        onClick={() => handleEdit(d)}
                                                        style={actionBtnStyle}
                                                        title="Edit"
                                                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'; e.currentTarget.style.color = 'var(--accent-color)'; }}
                                                        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(d._id)}
                                                        style={actionBtnStyle}
                                                        title="Delete"
                                                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.color = 'var(--danger)'; }}
                                                        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="3 6 5 6 21 6"></polyline>
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div style={{
                                            width: '100%',
                                            height: '6px',
                                            background: 'rgba(255,255,255,0.1)',
                                            borderRadius: '3px',
                                            marginBottom: '10px'
                                        }}>
                                            <div style={{
                                                width: `${progress}%`,
                                                height: '100%',
                                                background: 'var(--success)',
                                                borderRadius: '3px',
                                                transition: 'width 0.5s ease'
                                            }}></div>
                                        </div>

                                        <div className="flex-between" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '15px' }}>
                                            <div>
                                                EMI: <strong>${d.emiAmount}</strong> / month
                                                <div style={{ fontSize: '0.8rem', marginTop: '4px', color: 'var(--accent-color)' }}>
                                                    Est. Payoff: <strong>{payoffTime}</strong> ⏳
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                Due: <strong>{d.dueDate}th</strong>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="text-center" style={{ padding: '40px', color: 'var(--success)' }}>
                                    <h3>🎉 Debt Free!</h3>
                                    <p>You have no recorded debts. Keep it up!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DebtManager;
