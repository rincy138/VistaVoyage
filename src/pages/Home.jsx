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
    const testBackend = async () => {
        try {
            const res = await fetch('/api/test');
            const data = await res.json();
            alert(data.message);
        } catch (err) {
            alert('Failed to connect to backend: ' + err.message);
        }
    };

    return (
        <>
            <Hero />
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <button
                    onClick={testBackend}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#fab1a0',
                        color: 'black',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                    }}
                >
                    Test Backend Connection
                </button>
            </div>
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

