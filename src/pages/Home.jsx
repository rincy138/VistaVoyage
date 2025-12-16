import Hero from '../components/Hero';
import DestinationCard from '../components/DestinationCard';
import './Home.css';

const destinations = [
    {
        id: 1,
        title: "Bali, Indonesia",
        location: "Indonesia",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1938&auto=format&fit=crop",
        price: "₹1,200"
    },
    {
        id: 2,
        title: "Santorini, Greece",
        location: "Greece",
        image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1929&auto=format&fit=crop",
        price: "₹1,800"
    },
    {
        id: 3,
        title: "Kyoto, Japan",
        location: "Japan",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop",
        price: "₹2,100"
    }
];

const Home = () => {
    return (
        <>
            <Hero />
            <section className="destinations-section">
                <h2 className="section-title">Popular <span>Destinations</span></h2>
                <div className="destinations-grid">
                    {destinations.map(dest => (
                        <DestinationCard key={dest.id} destination={dest} />
                    ))}
                </div>
            </section>
        </>
    );
};

export default Home;
