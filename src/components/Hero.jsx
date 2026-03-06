import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="hero">
            <div className="hero-background">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="hero-video"
                    poster="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2071&auto=format&fit=crop"
                >
                    <source src="https://player.vimeo.com/external/371433846.sd.mp4?s=231da7375ed2160d96d38e789c625890b0e91024&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
                    <img
                        src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2071&auto=format&fit=crop"
                        alt="Majestic Taj Mahal"
                        className="hero-fallback-image"
                    />
                </video>
            </div>
            <div className="hero-content">
                <div className="hero-badge">✨ Featured Experience</div>
                <h1 className="hero-title">Discover the Magic of <span>Incredible India</span></h1>
                <p className="hero-subtitle">From misty mountains to golden beaches, experience the diverse soul of India.</p>

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
