import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi there! I'm your VistaVoyage assistant. How can I help you plan your dream trip today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Send to Backend API
        try {
            const response = await fetch('/api/chatbot/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            });

            const data = await response.json();

            setMessages(prev => [...prev, { id: Date.now() + 1, text: data.response, sender: 'bot' }]);
        } catch (error) {
            console.error("Chatbot API Error:", error);
            // Fallback response if server is down
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "I'm having trouble connecting to the server. Please check your connection or try again later.",
                sender: 'bot'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="chatbot-container">
            {/* 1. Floating Mascot Trigger (Visible when chat is CLOSED) */}
            {!isOpen && (
                <div className="chatbot-trigger-wrapper" onClick={() => setIsOpen(true)}>
                    <div className="mascot-floating-trigger">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
                            alt="AI Assistant"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;background:#2dd4bf;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;box-shadow:0 4px 10px rgba(0,0,0,0.2)"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg></div>';
                            }}
                        />
                    </div>
                </div>
            )}

            {/* 2. Main Chat Window */}
            <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>

                {/* Close Button Top Right */}
                <button className="chat-close-btn" onClick={() => {
                    setIsOpen(false);
                    setMessages([{ id: 1, text: "Hi there! I'm your VistaVoyage assistant. How can I help you plan your dream trip today?", sender: 'bot' }]);
                }}>
                    <X size={20} />
                </button>

                {/* Floating Mascot Header (Visible when chat is OPEN) */}
                <div className="chat-mascot-header">
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
                        alt="AI Assistant"
                        className="mascot-image"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                    <div className="mascot-glow"></div>
                </div>

                {/* Chat Area */}
                <div className="chat-content-area">
                    {/* Welcome / Empty State */}
                    {messages.length === 0 && (
                        <div className="welcome-state">
                            <h3>Hi, I'm Vista! 👋</h3>
                            <p>I can help you plan your perfect trip.</p>
                        </div>
                    )}

                    {/* Messages List */}
                    <div className="messages-list">
                        {messages.map(msg => (
                            <div key={msg.id} className={`chat-message ${msg.sender}`}>
                                {msg.sender === 'bot' && <div className="bot-icon"><Bot size={16} /></div>}
                                <div className="message-content">
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="chat-message bot">
                                <div className="bot-icon"><Bot size={16} /></div>
                                <div className="message-content typing">
                                    <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestion Chips (Only show if few messages) */}
                    {messages.length < 3 && (
                        <div className="suggestion-chips">
                            <button onClick={() => setInput("Cheapest flight from Delhi to Goa")}>
                                ✈️ Cheapest flight
                                <span>from Delhi to Goa</span>
                            </button>
                            <button onClick={() => setInput("Plan a relaxing weekend trip")}>
                                🌴 Plan a trip
                                <span>Relaxing weekend</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <form className="chat-input-wrapper" onSubmit={handleSend}>
                    <input
                        type="text"
                        placeholder="Where do you want to go?"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit" disabled={!input.trim()} className="send-btn">
                        {isTyping ? <div className="spinner"></div> : <Send size={18} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;
