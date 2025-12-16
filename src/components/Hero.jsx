import { Search } from 'lucide-react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-background">
                <img
                    src="https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?q=80&w=2064&auto=format&fit=crop"
                    alt="Beautiful landscape"
                />
            </div>
            <div className="hero-content">
                <h1 className="hero-title">Experience the World's Wonders</h1>
                <p className="hero-subtitle">Discover breathtaking destinations and create memories that last a lifetime.</p>

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
