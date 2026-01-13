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

        // Simulate Bot Response
        setTimeout(() => {
            let botResponse = "";
            const query = input.toLowerCase();

            if (query.includes("hotel") || query.includes("stay")) {
                botResponse = "We have a curated list of premium hotels across all major Indian cities. You can explore them in our 'Hotels' section!";
            } else if (query.includes("taxi") || query.includes("cab") || query.includes("transfer")) {
                botResponse = "Need a ride? Our city transfer service offers sedans, SUVs, and luxury coaches with verified drivers.";
            } else if (query.includes("offer") || query.includes("discount") || query.includes("deal")) {
                botResponse = "Check out our 'Travel Offers' page for exclusive discounts, like 20% off on Kerala houseboats!";
            } else if (query.includes("destination") || query.includes("place") || query.includes("where to go")) {
                botResponse = "India has it all! From the beaches of Goa to the mountains of Leh. Browse our 'Destinations' page for inspiration.";
            } else if (query.includes("hello") || query.includes("hi")) {
                botResponse = "Hello! I'm here to help you explore Incredible India. Ask me about packages, hotels, or taxis!";
            } else if (query.includes("planner")) {
                botResponse = "You should try our 'Smart Planner'! It uses your budget and interests to build the perfect itinerary in seconds.";
            } else {
                botResponse = "That sounds interesting! I'd recommend browsing our 'Packages' section to find the perfect match for your travel style.";
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
            setIsTyping(false);
        }, 1000);
    };

    return (
        <div className="chatbot-wrapper">
            {/* Chat Toggle Button */}
            <button
                className={`chatbot-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Chat"
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
                {!isOpen && <span className="notification-bubble">1</span>}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="bot-info">
                            <div className="bot-avatar">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h4>Travel Assistant</h4>
                                <span className="online-status">Online</span>
                            </div>
                        </div>
                        <button className="close-chat" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={`message-row ${msg.sender}`}>
                                <div className="message-bubble">
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message-row bot">
                                <div className="message-bubble typing">
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" disabled={!input.trim()}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
