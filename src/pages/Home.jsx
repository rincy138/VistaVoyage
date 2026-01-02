import Hero from '../components/Hero';
import DestinationCard from '../components/DestinationCard';
import './Home.css';

const destinations = [
    {
        id: 1,
        title: "Munnar Tea Hills",
        location: "Munnar, Kerala",
        image: "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?q=80&w=1974",
        price: "₹18,000"
    },
    {
        id: 2,
        title: "Pangong Lake",
        location: "Leh, Ladakh",
        image: "https://images.unsplash.com/photo-1544085311-11a028465b03?q=80&w=2070",
        price: "₹35,000"
    },
    {
        id: 3,
        title: "Araku Valley",
        location: "Vizag, Andhra Pradesh",
        image: "https://images.unsplash.com/photo-1627843606822-26cc4076757f?q=80&w=1974",
        price: "₹19,000"
    },
    {
        id: 4,
        title: "Tawang Monastery",
        location: "Arunachal Pradesh",
        image: "https://images.unsplash.com/photo-1623910547000-85f09919f96b?q=80&w=1974",
        price: "₹28,000"
    },
    {
        id: 5,
        title: "Goa Beaches",
        location: "Goa",
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1974",
        price: "₹13,000"
    },
    {
        id: 6,
        title: "Hampi Ruins",
        location: "Karnataka",
        image: "https://images.unsplash.com/photo-1600100397561-433998599046?q=80&w=2070",
        price: "₹17,000"
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

