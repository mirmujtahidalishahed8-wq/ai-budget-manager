import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AIAssistant = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const chatEndRef = useRef(null);

    // Initial Data Fetch (Insights)
    useEffect(() => {
        const getData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await axios.get('/api/ai/insights', { headers: { 'x-auth-token': token } });
                if (res.data && res.data.recommendations) {
                    setRecommendations(res.data.recommendations);
                }
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch insights", err);
                setLoading(false);
            }
        };
        getData();
    }, []);

    // Chat State
    const [question, setQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { type: 'ai', text: "Hey! I'm Money Mentor. I'm here to roast your spending or help you save. What's up?" }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    const handleAsk = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        const userMsg = { type: 'user', text: question };
        setChatHistory(prev => [...prev, userMsg]);
        setQuestion('');
        setIsTyping(true);

        try {
            const token = localStorage.getItem('token');
            // Simulate a bit of "thinking" time for the AI to feel more natural
            setTimeout(async () => {
                try {
                    const res = await axios.post('/api/ai/chat', { question: userMsg.text }, { headers: { 'x-auth-token': token } });
                    const aiMsg = { type: 'ai', text: res.data.answer };
                    setChatHistory(prev => [...prev, aiMsg]);
                } catch (err) {
                    const errorMsg = { type: 'ai', text: "My brain is offline. Try again later." };
                    setChatHistory(prev => [...prev, errorMsg]);
                } finally {
                    setIsTyping(false);
                }
            }, 600);

        } catch (err) {
            setIsTyping(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '40px' }}>

            <div className="text-center" style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>
                    Money Mentor <span style={{ color: 'var(--accent-secondary)' }}>Chat</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                    Your savage financial assistant.
                </p>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 350px', gap: '40px', alignItems: 'start' }}>

                {/* Left Column: Chat Interface */}
                <div className="chat-container">
                    <div className="chat-box">
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`chat-bubble ${msg.type}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="chat-bubble ai" style={{ width: '50px' }}>
                                <span className="typing-dots">...</span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleAsk} className="chat-input-area">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Type a message..."
                            autoFocus
                        />
                        <button type="submit" className="btn" style={{ borderRadius: '50%', width: '50px', height: '50px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            ➤
                        </button>
                    </form>
                </div>

                {/* Right Column: Insights & Quick Actions */}
                <div className="flex-col">
                    <div className="glass-card">
                        <h3 className="flex" style={{ marginBottom: '20px' }}>
                            <span style={{ fontSize: '1.5rem' }}>🔥</span> Hot Takes
                        </h3>
                        {loading ? (
                            <p style={{ color: 'var(--text-secondary)' }}>Analyzing your bad habits...</p>
                        ) : (
                            <div className="flex-col">
                                {recommendations.length > 0 ? recommendations.map((rec, i) => (
                                    <div key={i} style={{
                                        padding: '15px',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '16px',
                                        fontSize: '0.9rem',
                                        borderLeft: '3px solid var(--accent-secondary)'
                                    }}>
                                        {rec}
                                    </div>
                                )) : (
                                    <p style={{ color: 'var(--text-secondary)' }}>No insights yet. Spend some money first!</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="glass-card" style={{ background: 'var(--accent-color)', borderColor: 'var(--accent-color)' }}>
                        <h3 style={{ color: 'white' }}>Quick Ask</h3>
                        <div className="flex-col" style={{ gap: '10px' }}>
                            {[
                                "Can I afford a Tesla Model 3?",
                                "Can I buy an iPhone 16?",
                                "How much did I spend on food?",
                                "What is my debt status?"
                            ].map(q => (
                                <button
                                    key={q}
                                    onClick={() => { setQuestion(q); }}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: 'none',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    "{q}"
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AIAssistant;
