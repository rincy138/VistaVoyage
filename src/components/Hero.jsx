import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="hero">
            <div className="hero-background">
                <img
                    src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2071&auto=format&fit=crop"
                    alt="Majestic Taj Mahal"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=2000';
                    }}
                />
            </div>
            <div className="hero-content">
                <div className="hero-badge">✨ Featured Experience</div>
                <h1 className="hero-title">Discover the Magic of <span>Incredible India</span></h1>
                <p className="hero-subtitle">From misty mountains to golden beaches, experience the diverse soul of India.</p>
                <div className="hero-cta-group">
                    <button className="btn btn-primary" onClick={() => navigate('/packages')}>Quickly view destinations</button>
                </div>
            </div>
            <div className="scroll-indicator" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
                <div className="mouse">
                    <div className="wheel"></div>
                </div>
                <div className="arrow">
                    <span></span>
                    <span></span>
                </div>
            </div>
        </section>
    );
};

export default Hero;
