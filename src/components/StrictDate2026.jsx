import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import './StrictDate2026.css';

const StrictDate2026 = ({ value, onChange, className, name }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewMonth, setViewMonth] = useState(0); // 0 = Jan, 11 = Dec
    const containerRef = useRef(null);

    // Initialize viewMonth from value if present
    useEffect(() => {
        if (value) {
            const [y, m] = value.split('-');
            if (y === '2026') {
                setViewMonth(parseInt(m) - 1);
            }
        }
    }, [value]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getDaysInMonth = (month) => new Date(2026, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month) => new Date(2026, month, 1).getDay(); // 0 = Sun

    // Calculate accepted range: Full Year 2026
    const getRange = () => {
        return {
            start: new Date(2026, 0, 1),
            end: new Date(2026, 11, 31)
        };
    };

    const isDateDisabled = (day) => {
        const date = new Date(2026, viewMonth, day);
        const { start, end } = getRange();
        return date < start || date > end;
    };

    const handlePrevMonth = (e) => {
        e.stopPropagation();
        if (viewMonth > 0) setViewMonth(viewMonth - 1);
    };

    const handleNextMonth = (e) => {
        e.stopPropagation();
        if (viewMonth < 11) setViewMonth(viewMonth + 1);
    };

    const handleDayClick = (day) => {
        if (isDateDisabled(day)) return;

        const m = (viewMonth + 1).toString().padStart(2, '0');
        const d = day.toString().padStart(2, '0');
        const dateStr = `2026-${m}-${d}`;

        const event = {
            target: {
                name: name || 'travelDate',
                value: dateStr
            }
        };
        onChange(event);
        setIsOpen(false);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Select Date';
        const [y, m, d] = dateStr.split('-');
        if (y !== '2026') return dateStr;
        const date = new Date(2026, parseInt(m) - 1, parseInt(d));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className={`strict-date-container ${className || ''}`} ref={containerRef}>
            <div className="sd-trigger" onClick={() => setIsOpen(!isOpen)}>
                <CalendarIcon size={18} className="sd-icon" />
                <span className="sd-value">{formatDate(value)}</span>
            </div>

            {isOpen && (
                <div className="sd-popup">
                    <div className="sd-header">
                        <button
                            type="button"
                            className="sd-nav-btn"
                            onClick={handlePrevMonth}
                            disabled={viewMonth === 0}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="sd-month-title">{months[viewMonth]} 2026</span>
                        <button
                            type="button"
                            className="sd-nav-btn"
                            onClick={handleNextMonth}
                            disabled={viewMonth === 11}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="sd-grid">
                        <div className="sd-weekdays">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <span key={d}>{d}</span>
                            ))}
                        </div>
                        <div className="sd-days">
                            {Array.from({ length: getFirstDayOfMonth(viewMonth) }).map((_, i) => (
                                <span key={`empty-${i}`} className="sd-day empty" />
                            ))}
                            {Array.from({ length: getDaysInMonth(viewMonth) }).map((_, i) => {
                                const day = i + 1;
                                const isSelected = value === `2026-${(viewMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                                const disabled = isDateDisabled(day);
                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        className={`sd-day ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleDayClick(day)}
                                        disabled={disabled}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StrictDate2026;
