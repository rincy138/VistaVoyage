import { Search } from 'lucide-react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-background">
                <img
                    src="https://images.unsplash.com/photo-1626071465997-d861d85be26e?q=80&w=2074&auto=format&fit=crop"
                    alt="Aesthetic Indian Destination"
                />
            </div>
            <div className="hero-content">
                <h1 className="hero-title">Discover the Magic of <span>Incredible India</span></h1>
                <p className="hero-subtitle">From misty mountains to golden beaches, experience the diverse soul of India.</p>

                <div className="hero-search-container">
                    <input
                        type="text"
                        className="hero-search-input"
                        placeholder="Where do you want to go?"
                    />
                    <button className="hero-search-btn">
                        Explore
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
