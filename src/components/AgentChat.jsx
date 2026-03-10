import { useState, useEffect, useRef, useContext } from 'react';
import { MessageSquare, X, Send, User, Search } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './AgentChat.css';

const AgentChat = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-agent-chat', handleOpen);
        return () => window.removeEventListener('open-agent-chat', handleOpen);
    }, []);

    useEffect(() => {
        if (selectedAgent && isOpen) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000); // Polling for new messages
            return () => clearInterval(interval);
        }
    }, [selectedAgent, isOpen]);

    useEffect(() => {
        if (isOpen && !selectedAgent) {
            fetchAgents();
        }
        if (isOpen) {
            scrollToBottom();
        }
    }, [isOpen, selectedAgent, messages]);

    const fetchAgents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/messages/agents', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setAgents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch agents", err);
        }
    };

    const fetchMessages = async () => {
        if (!selectedAgent) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/messages/${selectedAgent.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setMessages(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        const msgText = input.trim();
        if (!msgText || !selectedAgent) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiver_id: selectedAgent.id,
                    message: msgText
                })
            });

            if (res.ok) {
                const newMessage = await res.json();
                setMessages(prev => [...prev, newMessage]);
                setInput('');
                scrollToBottom();
            }
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const filteredAgents = agents.filter(agent =>
        agent.email === 'travelagent@gmail.com'
    );

    if (user?.role === 'Agent') return null; // Logic handled in AgentDashboard for agents

    return (
        <div className="agent-chat-container">
            {/* 2. Main Chat Window - Premium Style */}
            <div className={`chat-window-premium ${isOpen ? 'open' : ''}`}>
                <div className="chat-header-premium">
                    <div className="header-user-info">
                        {selectedAgent ? (
                            <>
                                <button className="back-btn" onClick={() => setSelectedAgent(null)}>
                                    ←
                                </button>
                                <div className="user-avatar-sm">
                                    {selectedAgent.profile_picture ? (
                                        <img src={selectedAgent.profile_picture} alt={selectedAgent.name} />
                                    ) : (
                                        <User size={18} />
                                    )}
                                </div>
                                <div>
                                    <h5>{selectedAgent.name}</h5>
                                    <span className="user-status-online">Expert Travel Agent</span>
                                </div>
                            </>
                        ) : (
                            <h5>Select a Travel Agent</h5>
                        )}
                    </div>
                    <button className="close-chat-btn" onClick={() => {
                        setIsOpen(false);
                        setSelectedAgent(null);
                    }}>
                        <X size={20} />
                    </button>
                </div>

                {!selectedAgent ? (
                    <div className="agent-selection-area">
                        <div className="agent-list-scroll" style={{ marginTop: '20px' }}>
                            {filteredAgents.length > 0 ? (
                                filteredAgents.map(agent => (
                                    <div
                                        key={agent.id}
                                        className="agent-select-item"
                                        onClick={() => setSelectedAgent(agent)}
                                    >
                                        <div className="user-avatar-md">
                                            {agent.profile_picture ? (
                                                <img src={agent.profile_picture} alt={agent.name} />
                                            ) : (
                                                <User size={24} />
                                            )}
                                        </div>
                                        <div className="agent-item-info">
                                            <h6>{agent.name}</h6>
                                            <p>{agent.email}</p>
                                        </div>
                                        <div className="select-arrow">→</div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-agents">No agents found.</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="messages-area-premium">
                            {messages.length === 0 ? (
                                <div className="empty-chat">
                                    <div className="empty-icon"><MessageSquare size={48} /></div>
                                    <p>Start a conversation with {selectedAgent.name}.</p>
                                    <span className="hint">Ask about packages, prices, or custom itineraries!</span>
                                </div>
                            ) : (
                                messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`message-bubble-wrapper ${msg.sender_id === user.id ? 'sent' : 'received'}`}
                                    >
                                        <div className="message-bubble">
                                            {msg.message}
                                            <span className="message-time">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-premium" onSubmit={handleSend}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button type="submit" disabled={!input.trim()}>
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default AgentChat;
