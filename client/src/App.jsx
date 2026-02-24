import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ExpenseTracker from './pages/ExpenseTracker';
import DebtManager from './pages/DebtManager';
import AIAssistant from './pages/AIAssistant';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    if (!user) return null;

    return (
        <nav className="navbar">
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white', letterSpacing: '-1px' }}>
                Money<span style={{ color: 'var(--accent-color)' }}>Mentor</span>
            </div>
            <div className="nav-links">
                <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink>
                <NavLink to="/tracker" className={({ isActive }) => isActive ? "active" : ""}>Tracker</NavLink>
                <NavLink to="/debts" className={({ isActive }) => isActive ? "active" : ""}>Debts</NavLink>
                <NavLink to="/ai" className={({ isActive }) => isActive ? "active" : ""}>Assistant</NavLink>
                <a href="#" onClick={logout} style={{ color: 'var(--danger)' }}>Logout</a>
            </div>
        </nav>
    );
};

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div className="text-center" style={{ marginTop: '50px' }}>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <div className="container">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/tracker" element={<ProtectedRoute><ExpenseTracker /></ProtectedRoute>} />
                        <Route path="/debts" element={<ProtectedRoute><DebtManager /></ProtectedRoute>} />
                        <Route path="/ai" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
