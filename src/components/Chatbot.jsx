import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi there! I'm **Vista**, your VistaVoyage assistant. How can I help you plan your dream trip today? 👋", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const switchToAgent = () => {
        setIsOpen(false);
        window.dispatchEvent(new CustomEvent('open-agent-chat'));
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isTyping]);

    const formatMessage = (text) => {
        // Simple Markdown-lite: Bold (**text**) and Line breaks (\n)
        const parts = text.split(/(\*\*.*?\*\*|\n)/g);
        return parts.map((part, i) => {
            if (part && part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            } else if (part === '\n') {
                return <br key={i} />;
            }
            return part;
        });
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        const msgText = input.trim();
        if (!msgText) return;

        const userMsg = { id: Date.now(), text: msgText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/chatbot/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msgText })
            });

            const data = await response.json();
            setMessages(prev => [...prev, { id: Date.now() + 1, text: data.response, sender: 'bot' }]);
        } catch (error) {
            console.error("Chatbot API Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "I'm having trouble connecting to my travel books right now. 📚 Please try again in a moment.",
                sender: 'bot'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSuggestionClick = (text) => {
        setInput(text);
        // We need a slight delay or use a ref to send immediately
        setTimeout(() => {
            document.getElementById('chatbot-send-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }, 10);
    };

    return (
        <div className="chatbot-container">
            {/* 1. Floating Mascot Trigger */}
            {!isOpen && (
                <div className="chatbot-trigger-wrapper" onClick={() => setIsOpen(true)}>
                    <div className="chatbot-trigger-label">Need help? Ask Vista!</div>
                    <div className="mascot-floating-trigger">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
                            alt="AI Assistant"
                        />
                    </div>
                </div>
            )}

            {/* 2. Main Chat Window */}
            <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>

                {/* Header */}
                <div className="chat-window-header">
                    <div className="header-info">
                        <Bot size={20} className="header-bot-icon" />
                        <div>
                            <h4>Vista Assistant</h4>
                            <span className="online-badge">Online</span>
                        </div>
                    </div>
                    <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="chat-content-area">
                    <div className="messages-list">
                        {messages.map(msg => (
                            <div key={msg.id} className={`chat-message ${msg.sender}`}>
                                {msg.sender === 'bot' && (
                                    <div className="bot-avatar">
                                        <img src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" alt="Bot" />
                                    </div>
                                )}
                                <div className="message-content">
                                    {formatMessage(msg.text)}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="chat-message bot">
                                <div className="bot-avatar">
                                    <img src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" alt="Bot" />
                                </div>
                                <div className="message-content typing">
                                    <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestion Chips */}
                    {messages.length < 5 && !isTyping && (
                        <div className="suggestion-chips">
                            <button onClick={() => handleSuggestionClick("Hotels in Munnar")}>🏨 Best Hotels</button>
                            <button onClick={() => handleSuggestionClick("Adventure packages?")}>🏔️ Adventures</button>
                            <button onClick={() => switchToAgent()} style={{ border: '2px solid #10b981', color: '#10b981' }}>🙋 Talk to Human</button>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <form id="chatbot-send-form" className="chat-input-wrapper" onSubmit={handleSend}>
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoFocus={isOpen}
                    />
                    <button type="submit" disabled={!input.trim() || isTyping} className="send-btn">
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;

