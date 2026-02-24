import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExpenseTracker = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        type: 'expense',
        category: '',
        amount: '',
        description: ''
    });

    const getTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/finance/transactions', { headers: { 'x-auth-token': token } });
            setTransactions(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        getTransactions();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Populate form with transaction data for editing
    const handleEdit = (transaction) => {
        setEditMode(true);
        setCurrentId(transaction._id);
        const scrollElement = document.getElementById("transaction-form");
        if (scrollElement) scrollElement.scrollIntoView({ behavior: "smooth" });

        setFormData({
            type: transaction.type,
            category: transaction.category,
            amount: transaction.amount,
            description: transaction.description || ''
        });
    };

    // Cancel edit mode
    const handleCancel = () => {
        setEditMode(false);
        setCurrentId(null);
        setFormData({ type: 'expense', category: '', amount: '', description: '' });
    };

    // Handle Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this transaction?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/finance/transactions/${id}`, { headers: { 'x-auth-token': token } });
            getTransactions();
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            if (editMode && currentId) {
                // UPDATE Request
                await axios.put(`/api/finance/transactions/${currentId}`, formData, { headers: { 'x-auth-token': token } });
                setEditMode(false);
                setCurrentId(null);
            } else {
                // CREATE Request
                await axios.post('/api/finance/transactions', formData, { headers: { 'x-auth-token': token } });
            }

            // Reset form and refresh list
            setFormData({ type: 'expense', category: '', amount: '', description: '' });
            getTransactions();

        } catch (err) {
            console.error("Submit failed", err);
        }
    };

    // Icon Styles
    const actionBtnStyle = {
        background: 'rgba(255, 255, 255, 0.05)',
        border: 'none',
        borderRadius: '8px', // larger radius
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
                <h2>Transaction Log</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Track every penny. No secrets.</p>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 1fr', alignItems: 'start', gap: '30px' }}>

                {/* Form Card */}
                <div id="transaction-form" className="glass-card" style={{ position: 'sticky', top: '100px' }}>
                    <div className="flex-between" style={{ marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>{editMode ? 'Edit Transaction' : 'Add Entry'}</h3>
                        {editMode && (
                            <button onClick={handleCancel} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.8rem', borderRadius: '20px' }}>
                                Cancel
                            </button>
                        )}
                    </div>

                    <form onSubmit={onSubmit} className="flex-col">
                        <div className="flex" style={{ gap: '10px' }}>
                            <button
                                type="button"
                                className={`btn ${formData.type === 'expense' ? 'btn-danger' : 'btn-secondary'}`}
                                style={{ flex: 1, opacity: formData.type === 'expense' ? 1 : 0.5, borderRadius: '12px' }}
                                onClick={() => setFormData({ ...formData, type: 'expense' })}
                            >
                                Expense 💸
                            </button>
                            <button
                                type="button"
                                className={`btn ${formData.type === 'income' ? 'btn' : 'btn-secondary'}`}
                                style={{ flex: 1, opacity: formData.type === 'income' ? 1 : 0.5, borderRadius: '12px' }}
                                onClick={() => setFormData({ ...formData, type: 'income' })}
                            >
                                Income 💰
                            </button>
                        </div>

                        <input
                            type="text"
                            name="category"
                            placeholder={formData.type === 'income' ? "Source (e.g. Salary)" : "Category (e.g. Starbucks)"}
                            value={formData.category}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="number"
                            name="amount"
                            placeholder="Amount ($)"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="description"
                            placeholder="Note (Optional)"
                            value={formData.description}
                            onChange={handleChange}
                        />
                        <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px', background: editMode ? 'var(--warning)' : 'var(--accent-color)', color: editMode ? '#1e293b' : 'white' }}>
                            {editMode ? 'Update Transaction' : 'Save Transaction'}
                        </button>
                    </form>
                </div>

                {/* History List */}
                <div className="glass-card" style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
                    <h3 style={{ marginBottom: '20px' }}>Recent Activity</h3>
                    {loading ? <p>Loading...</p> : (
                        <div className="flex-col" style={{ gap: '0' }}>
                            {transactions.length > 0 ? [...transactions]
                                .sort((a, b) => {
                                    // 1. Sort by Type: Income comes first
                                    if (a.type === 'income' && b.type === 'expense') return -1;
                                    if (a.type === 'expense' && b.type === 'income') return 1;

                                    // 2. Sort by Amount: Largest first (Descending)
                                    return b.amount - a.amount;
                                })
                                .map(t => (
                                    <div key={t._id} className="flex-between" style={{
                                        padding: '16px 0',
                                        borderBottom: '1px solid var(--border-color)',
                                        alignItems: 'center'
                                    }}>
                                        {/* Left Side: Icon & Details */}
                                        <div className="flex" style={{ gap: '15px', flex: 1 }}>
                                            <div style={{
                                                width: '44px', height: '44px',
                                                borderRadius: '50%',
                                                background: t.type === 'income' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.2rem',
                                                flexShrink: 0
                                            }}>
                                                {t.type === 'income' ? '🤑' : '💸'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '1rem' }}>{t.category}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                                    {new Date(t.date).toLocaleDateString()}
                                                    {t.description && ` • ${t.description}`}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Amount & Actions */}
                                        <div className="flex-col" style={{ alignItems: 'flex-end', gap: '8px' }}>
                                            <div style={{
                                                color: t.type === 'income' ? 'var(--success)' : 'var(--accent-secondary)',
                                                fontWeight: '700',
                                                fontSize: '1.1rem'
                                            }}>
                                                {t.type === 'income' ? '+' : '-'}${t.amount}
                                            </div>

                                            <div className="flex" style={{ gap: '6px' }}>
                                                <button
                                                    onClick={() => handleEdit(t)}
                                                    style={actionBtnStyle}
                                                    className="edit-btn"
                                                    title="Edit"
                                                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'; e.currentTarget.style.color = 'var(--accent-color)'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(t._id)}
                                                    style={actionBtnStyle}
                                                    className="delete-btn"
                                                    title="Delete"
                                                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.color = 'var(--danger)'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                                    No transactions yet.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpenseTracker;
