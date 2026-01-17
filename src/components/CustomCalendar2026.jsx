import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import './CustomCalendar2026.css';

const CustomCalendar2026 = ({ value, onChange, className }) => {
    // Value: YYYY-MM-DD
    // Internal state for the VIEW only
    const [isOpen, setIsOpen] = useState(false);

    // Default to Jan 2026 if no date, or the month of the selected date
    const initialDate = value ? new Date(value) : new Date(2026, 0, 1);
    // Ensure we start in 2026 for the view
    const startMonth = initialDate.getFullYear() === 2026 ? initialDate.getMonth() : 0;

    const [viewMonth, setViewMonth] = useState(startMonth);
    const containerRef = useRef(null);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePrevMonth = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (viewMonth > 0) setViewMonth(viewMonth - 1);
    };

    const handleNextMonth = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (viewMonth < 11) setViewMonth(viewMonth + 1);
    };

    const handleDateClick = (day) => {
        const monthStr = (viewMonth + 1).toString().padStart(2, '0');
        const dayStr = day.toString().padStart(2, '0');
        const dateStr = `2026-${monthStr}-${dayStr}`;

        // Propagate change
        onChange({ target: { name: 'travelDate', value: dateStr } });
        setIsOpen(false);
    };

    // Calendar generation logic
    const getDaysInMonth = (month) => new Date(2026, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month) => new Date(2026, month, 1).getDay();

    const daysInMonth = getDaysInMonth(viewMonth);
    const firstDay = getFirstDayOfMonth(viewMonth);

    const blanks = Array.from({ length: firstDay }, (_, i) => <div key={`blank-${i}`} className="cal-day empty"></div>);
    const days = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const currentStr = `2026-${(viewMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const isSelected = value === currentStr;

        return (
            <div
                key={day}
                className={`cal-day ${isSelected ? 'selected' : ''}`}
                onClick={() => handleDateClick(day)}
            >
                {day}
            </div>
        );
    });

    const totalSlots = [...blanks, ...days];

    return (
        <div className={`custom-calendar-container ${className || ''}`} ref={containerRef}>
            {/* Input Trigger */}
            <div className="calendar-trigger" onClick={() => setIsOpen(!isOpen)}>
                <CalendarIcon size={18} />
                <span>{value || "Select Date"}</span>
            </div>

            {/* Dropdown Calendar */}
            {isOpen && (
                <div className="calendar-popup glass-card">
                    <div className="cal-header">
                        <button
                            className="nav-btn"
                            onClick={handlePrevMonth}
                            disabled={viewMonth === 0}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="month-year-display">
                            <span className="cal-month">{monthNames[viewMonth]}</span>
                            <span className="cal-year">2026</span>
                        </div>
                        <button
                            className="nav-btn"
                            onClick={handleNextMonth}
                            disabled={viewMonth === 11}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="cal-grid">
                        <div className="week-days">
                            {daysOfWeek.map(d => <div key={d} className="week-day">{d}</div>)}
                        </div>
                        <div className="days-grid">
                            {totalSlots}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomCalendar2026;
