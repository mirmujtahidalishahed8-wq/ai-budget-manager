import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const res = await axios.get('/api/ai/insights', { headers: { 'x-auth-token': token } });
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Dashboard Load Error:", err);
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [navigate]);

    if (loading) return <div className="text-center" style={{ marginTop: '50px' }}>Loading your financial reality...</div>;
    if (!data) return <div className="text-center text-danger">Error loading data. Is the server running?</div>;

    const { financialHealth, alerts, prediction } = data;

    // Chart Options for Dark Mode
    const chartOptions = {
        plugins: {
            legend: {
                labels: { color: '#ffffff', font: { family: 'Outfit', size: 14 } }
            }
        },
        cutout: '70%',
        responsive: true,
        maintainAspectRatio: false
    };

    const chartData = {
        labels: ['Income', 'Expenses'],
        datasets: [
            {
                data: [financialHealth.totalIncome, financialHealth.totalExpense],
                backgroundColor: ['#3b82f6', '#ec4899'], // Blue vs Pink
                borderColor: ['#1e293b', '#1e293b'],
                borderWidth: 2,
                hoverOffset: 10
            },
        ],
    };

    return (
        <div className="animate-fade-in">
            <div className="flex-between" style={{ marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ marginBottom: '5px' }}>Overview</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Welcome back, Boss.</p>
                </div>
                <button className="btn" onClick={() => navigate('/ai')}>
                    Ask Money Mentor 💬
                </button>
            </div>

            {/* Alerts Section (Roasts/Notifications) */}
            {alerts.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                    {alerts.map((alert, index) => (
                        <div key={index} className="glass-card flex" style={{
                            marginBottom: '10px',
                            borderLeft: `4px solid ${alert.type === 'danger' ? 'var(--danger)' : 'var(--warning)'}`,
                            background: 'rgba(255,255,255,0.03)',
                            padding: '15px 20px'
                        }}>
                            <span style={{ fontSize: '1.5rem', marginRight: '15px' }}>
                                {alert.type === 'danger' ? '🔥' : '⚠️'}
                            </span>
                            <div>
                                <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>
                                    {alert.type === 'danger' ? 'Wait a minute...' : 'Heads up'}
                                </strong>
                                <span style={{ color: 'var(--text-secondary)' }}>{alert.message}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid">
                {/* Balance Card */}
                <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '5rem', opacity: 0.05 }}>💰</div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Balance</h3>
                    <h1 style={{ fontSize: '2.5rem', margin: '10px 0' }}>
                        ${financialHealth.balance.toFixed(2)}
                    </h1>
                    <div className="flex" style={{ gap: '10px' }}>
                        <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            background: 'rgba(52, 211, 153, 0.2)',
                            color: 'var(--success)',
                            fontSize: '0.85rem',
                            fontWeight: 'bold'
                        }}>
                            Save Rate: {financialHealth.savingsRate.toFixed(1)}%
                        </span>
                    </div>
                </div>

                {/* Prediction Card */}
                <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '5rem', opacity: 0.05 }}>🔮</div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Forecast</h3>
                    <h1 style={{ fontSize: '2.5rem', margin: '10px 0' }}>
                        ${prediction.nextMonthBalance}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {prediction.message}
                    </p>
                </div>

                {/* Donut Chart */}
                <div className="glass-card flex-col flex-center" style={{ minHeight: '300px' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>In vs Out</h3>
                    <div style={{ width: '220px', height: '220px' }}>
                        <Doughnut data={chartData} options={chartOptions} />
                    </div>
                    <div className="flex" style={{ gap: '20px', marginTop: '15px' }}>
                        <div className="text-center">
                            <div style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Income</div>
                            <div>${financialHealth.totalIncome}</div>
                        </div>
                        <div className="text-divider" style={{ width: '1px', height: '30px', background: 'var(--border-color)' }}></div>
                        <div className="text-center">
                            <div style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>Expense</div>
                            <div>${financialHealth.totalExpense}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid" style={{ marginTop: '20px' }}>
                <div className="glass-card flex-between" style={{ alignItems: 'center' }}>
                    <div>
                        <h3>Quick Add</h3>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Log a new transaction instantly.</p>
                    </div>
                    <button className="btn" onClick={() => navigate('/tracker')}>
                        + Add Transaction
                    </button>
                </div>
                <div className="glass-card flex-between" style={{ alignItems: 'center' }}>
                    <div>
                        <h3>Debt Status</h3>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Check your loans and EMIs.</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate('/debts')}>
                        View Debts
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
