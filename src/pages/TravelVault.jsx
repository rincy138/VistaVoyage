import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
    Lock,
    Unlock,
    FileText,
    Clock,
    Plus,
    Shield,
    Calendar,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    Search,
    Image,
    Camera,
    Edit3
} from 'lucide-react';
import './TravelVault.css';

const TravelVault = () => {
    const { user } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // all, voice, notes
    const [newNote, setNewNote] = useState({ title: '', content: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [editingNote, setEditingNote] = useState(null);
    const [editNoteForm, setEditNoteForm] = useState({ title: '', content: '' });
    const fileInputRef = useRef(null);

    const handleUpdateNote = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/vault/${editingNote.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editNoteForm.title,
                    content: editNoteForm.content
                })
            });

            if (response.ok) {
                setSuccessMessage('Memory updated successfully!');
                setEditingNote(null);
                fetchVaultItems();
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    const handleEditNote = (item) => {
        setEditingNote(item);
        setEditNoteForm({ title: item.title, content: item.content });
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;
            await savePhotoMemory(file.name, base64String);
        };
        reader.readAsDataURL(file);
    };

    const savePhotoMemory = async (fileName, base64Data) => {
        const unlockDate = new Date();
        unlockDate.setFullYear(unlockDate.getFullYear() + 5);

        try {
            const response = await fetch('/api/vault/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    type: 'Photo',
                    title: fileName.length > 30 ? fileName.substring(0, 27) + '...' : fileName,
                    content: 'A captured moment from your journey.',
                    file_path: base64Data,
                    unlock_date: unlockDate.toISOString()
                })
            });

            if (response.ok) {
                setSuccessMessage('Photo locked for 5 years!');
                setShowAddModal(false);
                fetchVaultItems();
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error saving photo:', error);
        }
    };

    useEffect(() => {
        fetchVaultItems();
    }, [user]);

    const fetchVaultItems = async () => {
        if (!user) return;
        try {
            const response = await fetch(`/api/vault/${user.id}`);
            const data = await response.json();
            setItems(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching vault items:', error);
            setLoading(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        try {
            // Set unlock date to 5 years from now
            const unlockDate = new Date();
            unlockDate.setFullYear(unlockDate.getFullYear() + 5);

            const response = await fetch('/api/vault/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    type: 'Note',
                    title: newNote.title,
                    content: newNote.content,
                    unlock_date: unlockDate.toISOString()
                })
            });

            if (response.ok) {
                setSuccessMessage('Note locked in vault for 5 years!');
                setShowAddModal(false);
                setNewNote({ title: '', content: '' });
                fetchVaultItems();
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error adding note:', error);
        }
    };

    const filteredItems = items.filter(item => {
        if (item.type?.toLowerCase() === 'voice') return false; // Hide any existing voice items
        const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.content?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' || item.type?.toLowerCase() === activeTab.slice(0, -1).toLowerCase();
        return matchesSearch && matchesTab;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getTimeRemaining = (unlockDate) => {
        const diff = new Date(unlockDate) - new Date();
        const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
        const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
        return `${years} years, ${months} months remaining`;
    };

    return (
        <div className="vault-container">
            {successMessage && (
                <div className="success-toast">
                    <CheckCircle2 size={20} />
                    <span>{successMessage}</span>
                </div>
            )}

            <header className="vault-header">
                <div className="header-content">
                    <div className="title-group">
                        <Lock className="vault-icon" size={32} />
                        <h1>Legacy Travel Vault</h1>
                    </div>
                    <p>Preserve your memories in a time capsule. Revisit them 5 years from now.</p>
                </div>
                <div className="vault-stats">
                    <div className="stat-card">
                        <span className="stat-value">
                            {items.filter(i => i.type?.toLowerCase() !== 'voice').length}
                        </span>
                        <span className="stat-label">Total Memories</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">
                            {items.filter(i => i.type?.toLowerCase() !== 'voice' && i.isLocked).length}
                        </span>
                        <span className="stat-label">Locked</span>
                    </div>
                </div>
            </header>

            <div className="vault-controls">
                <div className="tab-group">
                    <button
                        className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >All</button>
                    <button
                        className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notes')}
                    >Notes</button>
                    <button
                        className={`tab ${activeTab === 'photos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('photos')}
                    >Photos</button>
                </div>

                <div className="search-bar">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search your memories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <button className="add-btn" onClick={() => setShowAddModal(true)}>
                    <Plus size={20} />
                    <span>Post New Memory</span>
                </button>
            </div>

            <div className="memory-grid">
                {filteredItems.map((item) => (
                    <div key={item.id} className={`memory-card ${item.isLocked ? 'locked' : 'unlocked'}`}>
                        <div className="card-header">
                            {item.type?.toLowerCase() === 'photo' ? <Image size={24} /> : <FileText size={24} />}
                            <span className="memory-type">{item.type}</span>
                            <div className="lock-badge">
                                {item.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                                {item.isLocked ? 'Locked' : 'Unlocked'}
                            </div>
                            {item.type === 'Note' && (
                                <button
                                    className="edit-note-btn"
                                    onClick={() => handleEditNote(item)}
                                    title="Edit Note"
                                >
                                    <Edit3 size={16} />
                                </button>
                            )}
                        </div>

                        <div className="card-body">
                            <h3>{item.title}</h3>
                            <div className="date-info">
                                <Calendar size={14} />
                                <span>Recorded on {formatDate(item.created_at)}</span>
                            </div>

                            {item.isLocked ? (
                                <div className="locked-content">
                                    {item.type?.toLowerCase() !== 'photo' && (
                                        <div className="lock-overlay">
                                            <Clock size={32} />
                                            <p>Locked in Time Capsule</p>
                                            <span className="time-remaining">{getTimeRemaining(item.unlock_date)}</span>
                                            <span className="unlock-badge-date">Created on: {formatDate(item.created_at)}</span>
                                        </div>
                                    )}
                                    {item.type?.toLowerCase() === 'photo' && item.file_path ? (
                                        <div className="memory-image-preview">
                                            <img src={item.file_path} alt="Locked Memory" />
                                        </div>
                                    ) : (
                                        <p className="blurred-text">
                                            This memory is safely preserved in our vault. It will be waiting for you.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="unlocked-content">
                                    {item.type === 'Photo' && item.file_path && (
                                        <div className="memory-image-preview">
                                            <img src={item.file_path} alt={item.title} />
                                        </div>
                                    )}
                                    <p>{item.content}</p>
                                    <button className="view-btn">
                                        View Full Memory <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="card-footer">
                            <Shield size={14} />
                            <span>Encrypted & Secured</span>
                        </div>
                    </div>
                ))}

                {filteredItems.length === 0 && (
                    <div className="empty-state">
                        <AlertCircle size={48} />
                        <h3>No Memories Found</h3>
                        <p>Start preserving your travel legacy today.</p>
                        <button className="primary-btn" onClick={() => setShowAddModal(true)}>
                            Capture First Memory
                        </button>
                    </div>
                )}
            </div>

            {
                showAddModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Capture a Memory</h2>
                            <p>Choose how you want to preserve this moment.</p>

                            <div className="capture-options">
                                <button className="capture-option" onClick={() => fileInputRef.current?.click()}>
                                    <div className="option-icon photo">
                                        <Image size={32} />
                                    </div>
                                    <div className="option-info">
                                        <h4>Photo Memory</h4>
                                        <p>Upload a picture from your trip</p>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                    />
                                </button>

                                <div className="divider"><span>OR</span></div>

                                <form onSubmit={handleAddNote} className="note-form">
                                    <input
                                        type="text"
                                        placeholder="Give your memory a title"
                                        required
                                        value={newNote.title}
                                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                    />
                                    <textarea
                                        placeholder="Write your emotional note here... How do you feel? What do you want your future self to remember?"
                                        required
                                        value={newNote.content}
                                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                    ></textarea>
                                    <div className="vault-warning">
                                        <AlertCircle size={16} />
                                        <span>This will be locked for exactly 5 years.</span>
                                    </div>
                                    <div className="modal-actions">
                                        <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                                        <button type="submit" className="save-btn">Lock Memory</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                editingNote && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header-with-icon">
                                <Edit3 size={24} className="edit-icon-modal" />
                                <h2>Edit Travel Note</h2>
                            </div>
                            <p>Update your preserved thoughts for the future.</p>

                            <form onSubmit={handleUpdateNote} className="note-form">
                                <input
                                    type="text"
                                    placeholder="Note title"
                                    required
                                    value={editNoteForm.title}
                                    onChange={(e) => setEditNoteForm({ ...editNoteForm, title: e.target.value })}
                                />
                                <textarea
                                    placeholder="Your content..."
                                    required
                                    value={editNoteForm.content}
                                    onChange={(e) => setEditNoteForm({ ...editNoteForm, content: e.target.value })}
                                ></textarea>
                                <div className="modal-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setEditingNote(null)}>Cancel</button>
                                    <button type="submit" className="save-btn">Update Memory</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default TravelVault;
