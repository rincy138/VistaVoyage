import { useState } from 'react';
import {
    Briefcase,
    Thermometer,
    Stethoscope,
    AlertTriangle,
    Check,
    Calendar,
    MapPin,
    CloudIcon,
    Camera,
    Tent,
    Waves,
    Mountain,
    Church
} from 'lucide-react';
import './PackingAssistant.css';

const PackingAssistant = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        destination: '',
        month: 'January',
        duration: 3,
        activities: []
    });
    const [checklist, setChecklist] = useState(null);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const activitiesList = [
        { id: 'hiking', label: 'Hiking', icon: <Mountain size={20} /> },
        { id: 'beach', label: 'Beach', icon: <Waves size={20} /> },
        { id: 'sightseeing', label: 'Sightseeing', icon: <Camera size={20} /> },
        { id: 'camping', label: 'Camping', icon: <Tent size={20} /> },
        { id: 'spiritual', label: 'Temples', icon: <Church size={20} /> },
    ];

    const toggleActivity = (id) => {
        setFormData(prev => ({
            ...prev,
            activities: prev.activities.includes(id)
                ? prev.activities.filter(a => a !== id)
                : [...prev.activities, id]
        }));
    };

    const handleGenerate = () => {
        // Logic to generate checklist based on input
        const { destination, month, activities } = formData;

        let weatherClothes = ['Innerwear', 'Socks', 'Sleepwear'];
        let healthItems = ['First-aid kit', 'Personal medications', 'Hand sanitizer', 'Masks'];
        let essentials = ['Travel documents', 'Phone & Charger', 'Power bank', 'Toiletries'];
        let activitiesItems = [];
        let warnings = [];

        // Simple weather logic (Mockup for India)
        const isWinter = ['December', 'January', 'February'].includes(month);
        const isMonsoon = ['June', 'July', 'August', 'September'].includes(month);
        const isHot = ['April', 'May', 'June'].includes(month);

        if (isWinter) {
            weatherClothes.push('Heavy jacket', 'Thermal wear', 'Woolen cap', 'Gloves');
        } else if (isMonsoon) {
            weatherClothes.push('Raincoat', 'Waterproof shoes', 'Umbrella');
        } else if (isHot) {
            weatherClothes.push('Light cotton clothes', 'Sunglasses', 'Sunscreen', 'Hat');
        } else {
            weatherClothes.push('Comfortable cottons', 'Light sweatshirt');
        }

        // Destination specific logic
        if (destination.toLowerCase().includes('manali') || destination.toLowerCase().includes('ladakh')) {
            weatherClothes.push('Extra heavy layers', 'UV sunglasses');
            healthItems.push('AMS medication (Altitude Sickness)', 'Moisturizer');
            warnings.push('High altitude area: Stay hydrated and acclimatize.');
        }

        if (destination.toLowerCase().includes('goa') || destination.toLowerCase().includes('kerala')) {
            weatherClothes.push('Flip flops', 'Shorts');
            healthItems.push('Insect repellent');
        }

        // Activity logic
        if (activities.includes('hiking')) {
            activitiesItems.push('Hiking boots', 'Backpack', 'Water bottle', 'Quick-dry towel');
        }
        if (activities.includes('beach')) {
            activitiesItems.push('Swimwear', 'Beach towel', 'Extra flip flops');
        }
        if (activities.includes('spiritual')) {
            warnings.push('Respectful attire required: Shoulders and knees should be covered in religious sites.');
            activitiesItems.push('Scarf or Dupatta', 'Easy-to-remove footwear');
        }

        setChecklist({
            weather: isWinter ? 'Cold' : isMonsoon ? 'Rainy' : isHot ? 'Hot' : 'Pleasant',
            clothing: [...new Set(weatherClothes)],
            health: [...new Set(healthItems)],
            essentials: [...new Set(essentials)],
            activities: [...new Set(activitiesItems)],
            warnings: [...new Set(warnings)]
        });
        setStep(3);
    };

    return (
        <div className="packing-page">
            <div className="container">
                <div className="packing-header">
                    <h1>Smart <span>Packing Assistant</span></h1>
                    <p>Get a personalized packing list powered by travel intelligence</p>
                </div>

                {step === 1 && (
                    <div className="packing-card">
                        <div className="step-count">Step 1 of 2</div>
                        <h3>Where and when?</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Destination</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Manali, Goa, Ladakh..."
                                    className="packing-input"
                                    value={formData.destination}
                                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Month of Travel</label>
                                <div className="select-grid">
                                    {months.slice(0, 6).map(m => (
                                        <div
                                            key={m}
                                            className={`select-item ${formData.month === m ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, month: m })}
                                        >
                                            {m.substring(0, 3)}
                                        </div>
                                    ))}
                                    {months.slice(6).map(m => (
                                        <div
                                            key={m}
                                            className={`select-item ${formData.month === m ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, month: m })}
                                        >
                                            {m.substring(0, 3)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Duration (Days): {formData.duration}</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    className="packing-input"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <button
                            className="btn btn-primary"
                            disabled={!formData.destination}
                            onClick={() => setStep(2)}
                        >
                            Next: Activities
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="packing-card">
                        <div className="step-count">Step 2 of 2</div>
                        <h3>What are your plans?</h3>
                        <div className="activity-grid">
                            {activitiesList.map(activity => (
                                <div
                                    key={activity.id}
                                    className={`activity-card ${formData.activities.includes(activity.id) ? 'active' : ''}`}
                                    onClick={() => toggleActivity(activity.id)}
                                >
                                    {activity.icon}
                                    <span>{activity.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="action-buttons">
                            <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                            <button className="btn btn-primary" onClick={handleGenerate}>Generate Checklist</button>
                        </div>
                    </div>
                )}

                {step === 3 && checklist && (
                    <div className="checklist-container">
                        <div className="weather-info">
                            <CloudIcon size={24} />
                            <div>
                                <strong>Expected Weather: {checklist.weather}</strong>
                                <p>Packing recommendations have been adjusted for {formData.month} in {formData.destination}.</p>
                            </div>
                        </div>

                        <div className="checklist-grid">
                            <div className="checklist-section">
                                <div className="section-title">
                                    <Thermometer size={20} />
                                    <h3>Clothing</h3>
                                </div>
                                <ul className="checklist-items">
                                    {checklist.clothing.map((item, i) => (
                                        <li key={i} className="checklist-item">
                                            <div className="checkmark"><Check size={14} /></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="checklist-section">
                                <div className="section-title">
                                    <Briefcase size={20} />
                                    <h3>Essentials</h3>
                                </div>
                                <ul className="checklist-items">
                                    {checklist.essentials.map((item, i) => (
                                        <li key={i} className="checklist-item">
                                            <div className="checkmark"><Check size={14} /></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="checklist-section">
                                <div className="section-title">
                                    <Stethoscope size={20} />
                                    <h3>Health & Hygiene</h3>
                                </div>
                                <ul className="checklist-items">
                                    {checklist.health.map((item, i) => (
                                        <li key={i} className="checklist-item">
                                            <div className="checkmark"><Check size={14} /></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {checklist.activities.length > 0 && (
                                <div className="checklist-section">
                                    <div className="section-title">
                                        <Tent size={20} />
                                        <h3>Activity Gear</h3>
                                    </div>
                                    <ul className="checklist-items">
                                        {checklist.activities.map((item, i) => (
                                            <li key={i} className="checklist-item">
                                                <div className="checkmark"><Check size={14} /></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {checklist.warnings.length > 0 && (
                                <div className="checklist-section" style={{ borderColor: 'rgba(251, 191, 36, 0.3)' }}>
                                    <div className="section-title">
                                        <AlertTriangle size={20} style={{ color: '#fbbf24' }} />
                                        <h3 style={{ color: '#fbbf24' }}>Important Notes</h3>
                                    </div>
                                    <ul className="checklist-items">
                                        {checklist.warnings.map((item, i) => (
                                            <li key={i} className="checklist-item warning">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <button className="generate-another" onClick={() => setStep(1)}>
                            Generate Another Checklist
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PackingAssistant;
