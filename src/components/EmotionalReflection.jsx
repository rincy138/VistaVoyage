import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
    Brain,
    Sparkles,
    Heart,
    Lightbulb,
    TrendingUp,
    ArrowRight,
    MessageSquare,
    ChevronLeft,
    Loader2
} from 'lucide-react';
import './EmotionalReflection.css';

const EmotionalReflection = ({ booking, onClose }) => {
    const { user } = useContext(AuthContext);
    const [step, setStep] = useState(0);
    const [responses, setResponses] = useState({
        change: '',
        learning: '',
        emotions: []
    });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analytics, setAnalytics] = useState(null);

    const questions = [
        {
            id: 'change',
            question: "Did this trip change you? If so, how?",
            icon: <Heart className="q-icon" />,
            placeholder: "Reflect on your inner transformation..."
        },
        {
            id: 'learning',
            question: "What did you learn about the world or yourself?",
            icon: <Lightbulb className="q-icon" />,
            placeholder: "Share your newfound wisdom..."
        }
    ];

    const handleNext = () => {
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            analyzeReflection();
        }
    };

    const analyzeReflection = async () => {
        setIsAnalyzing(true);

        // Mocking AI Analysis
        setTimeout(async () => {
            const mockAnalytics = {
                emotional_growth: 85,
                cultural_awareness: 92,
                self_discovery: 78,
                mindfulness_score: 88,
                dominant_vibe: "Transformative Enlightenment",
                summary: "This journey significantly expanded your horizons. You showed high levels of adaptability and a deep appreciation for diverse perspectives."
            };

            setAnalytics(mockAnalytics);
            setIsAnalyzing(false);
            setStep(questions.length); // Move to results step

            // Save to database
            try {
                await fetch('http://localhost:3000/api/reflections/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.user_id,
                        booking_id: booking.id,
                        responses: responses,
                        growth_analytics: mockAnalytics
                    })
                });
            } catch (error) {
                console.error('Error saving reflection:', error);
            }
        }, 3000);
    };

    return (
        <div className="reflection-modal">
            <div className="reflection-content">
                <header className="reflection-header">
                    <div className="ai-badge">
                        <Brain size={16} />
                        <span>Reflection AI</span>
                    </div>
                    {step < questions.length && (
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${((step + 1) / questions.length) * 100}%` }}></div>
                        </div>
                    )}
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </header>

                {step < questions.length ? (
                    <div className="question-step active">
                        <div className="q-branding">
                            {questions[step].icon}
                            <h2>{questions[step].question}</h2>
                        </div>
                        <textarea
                            value={responses[questions[step].id]}
                            onChange={(e) => setResponses({ ...responses, [questions[step].id]: e.target.value })}
                            placeholder={questions[step].placeholder}
                            autoFocus
                        ></textarea>
                        <div className="step-footer">
                            <span className="step-counter">Step {step + 1} of {questions.length}</span>
                            <button
                                className="next-btn"
                                disabled={!responses[questions[step].id]}
                                onClick={handleNext}
                            >
                                {step === questions.length - 1 ? 'Generate Analytics' : 'Continue'}
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                ) : isAnalyzing ? (
                    <div className="analysis-state">
                        <div className="loading-rings">
                            <div className="ring"></div>
                            <div className="ring"></div>
                            <div className="ring"></div>
                            <Brain size={64} className="brain-pulse" />
                        </div>
                        <h3>Analyzing your journey...</h3>
                        <p>Our AI is distilling your experiences into growth insights.</p>
                    </div>
                ) : (
                    <div className="results-state active">
                        <div className="results-header">
                            <Sparkles className="sparkle-icon" />
                            <h2>Your Growth Analytics</h2>
                            <p>Insights from your trip to {booking.item_name || booking.destination}</p>
                        </div>

                        <div className="analytics-grid">
                            <div className="analytics-card">
                                <TrendingUp className="card-icon" />
                                <div className="card-info">
                                    <span className="label">Emotional Growth</span>
                                    <div className="bar-container">
                                        <div className="bar-fill" style={{ width: `${analytics.emotional_growth}%` }}></div>
                                    </div>
                                    <span className="value">{analytics.emotional_growth}%</span>
                                </div>
                            </div>
                            <div className="analytics-card">
                                <Heart className="card-icon" />
                                <div className="card-info">
                                    <span className="label">Mindfulness</span>
                                    <div className="bar-container">
                                        <div className="bar-fill" style={{ width: `${analytics.mindfulness_score}%` }}></div>
                                    </div>
                                    <span className="value">{analytics.mindfulness_score}%</span>
                                </div>
                            </div>
                            <div className="analytics-card">
                                <MessageSquare className="card-icon" />
                                <div className="card-info">
                                    <span className="label">Cultural Awareness</span>
                                    <div className="bar-container">
                                        <div className="bar-fill" style={{ width: `${analytics.cultural_awareness}%` }}></div>
                                    </div>
                                    <span className="value">{analytics.cultural_awareness}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="ai-summary">
                            <div className="summary-title"> AI INSIGHT</div>
                            <p>"{analytics.summary}"</p>
                            <div className="vibe-tag">
                                Dominant Energy: <strong>{analytics.dominant_vibe}</strong>
                            </div>
                        </div>

                        <button className="finish-btn" onClick={onClose}>
                            Preserve Insights
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmotionalReflection;
