import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');
const db = new Database(dbPath);

const allCityHotels = {
    "Goa": [
        { name: "Taj Exotica Resort & Spa", location: "Benaulim Beach", type: "Beach Resort", rating: 4.9, price: 22000, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4", amenities: ["Private Beach", "Spa", "Pool", "Fine Dining"] },
        { name: "The Leela Goa", location: "Mobor Beach", type: "Luxury Resort", rating: 4.8, price: 25000, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d", amenities: ["Golf Course", "Casino", "Beach Access", "Spa"] },
        { name: "Alila Diwa Goa", location: "Majorda Beach", type: "Beach Resort", rating: 4.7, price: 18000, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945", amenities: ["Infinity Pool", "Spa", "Yoga", "Beach"] },
        { name: "Park Hyatt Goa Resort", location: "Arossim Beach", type: "Beach Resort", rating: 4.8, price: 20000, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", amenities: ["Beach Villa", "Pool", "Spa", "Restaurant"] },
        { name: "W Goa", location: "Vagator Beach", type: "Boutique Resort", rating: 4.6, price: 16000, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", amenities: ["Beach Club", "DJ Nights", "Pool", "Bar"] },
        { name: "Grand Hyatt Goa", location: "Bambolim Beach", type: "Resort", rating: 4.7, price: 19000, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4", amenities: ["Casino", "Spa", "Pool", "Golf"] },
        { name: "Cidade de Goa", location: "Vainguinim Beach", type: "Heritage Resort", rating: 4.5, price: 12000, image: "https://images.unsplash.com/photo-1596436889106-be35e843f974", amenities: ["Heritage", "Pool", "Beach", "Restaurant"] },
        { name: "Novotel Goa Dona Sylvia", location: "Cavelossim Beach", type: "Beach Resort", rating: 4.4, price: 11000, image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7", amenities: ["Beach", "Pool", "Spa", "Kids Club"] },
        { name: "Zuri White Sands", location: "Varca Beach", type: "Beach Resort", rating: 4.6, price: 14000, image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c", amenities: ["Beach", "Pool", "Spa", "Casino"] },
        { name: "Holiday Inn Resort Goa", location: "Mobor Beach", type: "Beach Resort", rating: 4.3, price: 9500, image: "https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904", amenities: ["Beach", "Pool", "Restaurant", "Bar"] }
    ],
    "Udaipur": [
        { name: "Taj Lake Palace", location: "Lake Pichola", type: "Heritage Palace", rating: 5.0, price: 45000, image: "https://images.unsplash.com/photo-1549463387-92c21a1d1235", amenities: ["Lake Palace", "Boat Ride", "Royal Dining", "Spa"] },
        { name: "Oberoi Udaivilas", location: "Lake Pichola", type: "Luxury Palace", rating: 5.0, price: 50000, image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461", amenities: ["Palace Stay", "Private Pool", "Spa", "Fine Dining"] },
        { name: "The Leela Palace Udaipur", location: "Lake Pichola", type: "Heritage Palace", rating: 4.9, price: 28000, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", amenities: ["Lake View", "Royal Decor", "Spa", "Pool"] },
        { name: "Fateh Garh", location: "Fateh Sagar Lake", type: "Heritage Hotel", rating: 4.7, price: 18000, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d", amenities: ["Lake View", "Heritage", "Pool", "Restaurant"] },
        { name: "Shiv Niwas Palace", location: "City Palace Complex", type: "Heritage Palace", rating: 4.8, price: 22000, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945", amenities: ["Palace", "Pool", "Heritage", "Dining"] },
        { name: "Radisson Blu Udaipur", location: "Fateh Sagar Lake", type: "Luxury Hotel", rating: 4.5, price: 12000, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", amenities: ["Lake View", "Pool", "Spa", "Restaurant"] },
        { name: "Trident Udaipur", location: "Haridasji Ki Magri", type: "Resort", rating: 4.6, price: 14000, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", amenities: ["Lake View", "Pool", "Spa", "Garden"] },
        { name: "Ramada Udaipur Resort", location: "Fateh Sagar Lake", type: "Resort", rating: 4.4, price: 10000, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4", amenities: ["Lake View", "Pool", "Restaurant", "Spa"] },
        { name: "Amet Haveli", location: "Lake Pichola", type: "Heritage Haveli", rating: 4.5, price: 8500, image: "https://images.unsplash.com/photo-1596436889106-be35e843f974", amenities: ["Lake View", "Heritage", "Rooftop", "Restaurant"] },
        { name: "Jagat Niwas Palace", location: "Lake Pichola", type: "Heritage Hotel", rating: 4.4, price: 7500, image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7", amenities: ["Lake View", "Heritage", "Rooftop Dining", "Pool"] }
    ],
    "Manali": [
        { name: "The Himalayan Resort", location: "Hadimba Road", type: "Mountain Resort", rating: 4.8, price: 14200, image: "https://images.unsplash.com/photo-1544085311-11a028465b03", amenities: ["Castle Stay", "Mountain Pool", "Spa", "Restaurant"] },
        { name: "Manu Allaya Resort", location: "Log Huts Area", type: "Luxury Resort", rating: 4.7, price: 16000, image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c", amenities: ["Mountain View", "Spa", "Pool", "Fine Dining"] },
        { name: "Solang Valley Resort", location: "Solang Valley", type: "Adventure Resort", rating: 4.6, price: 12000, image: "https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904", amenities: ["Adventure Sports", "Mountain View", "Restaurant", "Bonfire"] },
        { name: "Apple Country Resort", location: "Prini", type: "Cottage Resort", rating: 4.5, price: 9500, image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461", amenities: ["Apple Orchard", "Cottages", "River View", "Restaurant"] },
        { name: "Snow Valley Resorts", location: "Burwa", type: "Mountain Resort", rating: 4.4, price: 8000, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", amenities: ["Snow View", "Spa", "Restaurant", "Adventure"] },
        { name: "Span Resort & Spa", location: "Kullu-Manali Highway", type: "Spa Resort", rating: 4.7, price: 13000, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d", amenities: ["Spa", "Pool", "Mountain View", "Restaurant"] },
        { name: "Sterling Manali", location: "Aleo", type: "Resort", rating: 4.3, price: 7500, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945", amenities: ["Mountain View", "Activities", "Restaurant", "Pool"] },
        { name: "Honeymoon Inn", location: "Circuit House Road", type: "Boutique Hotel", rating: 4.2, price: 6000, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", amenities: ["Mountain View", "Cozy Rooms", "Restaurant", "Garden"] },
        { name: "The Orchard Greens", location: "Naggar Road", type: "Cottage Resort", rating: 4.5, price: 10000, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", amenities: ["Orchard", "Cottages", "Bonfire", "Restaurant"] },
        { name: "Banon Resorts", location: "Prini", type: "Resort", rating: 4.4, price: 8500, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4", amenities: ["River View", "Adventure", "Restaurant", "Bonfire"] }
    ],
    "Leh Ladakh": [
        { name: "The Grand Dragon Ladakh", location: "Leh", type: "Luxury Hotel", rating: 4.9, price: 10500, image: "https://images.unsplash.com/photo-1594220551065-9f9fa9bd36d9", amenities: ["Eco-Friendly", "Kashmiri Cuisine", "Mountain View", "Spa"] },
        { name: "The Zen Ladakh", location: "Leh", type: "Boutique Hotel", rating: 4.7, price: 9000, image: "https://images.unsplash.com/photo-1596436889106-be35e843f974", amenities: ["Mountain View", "Restaurant", "Garden", "Cultural Shows"] },
        { name: "Hotel Singge Palace", location: "Leh", type: "Heritage Hotel", rating: 4.6, price: 8000, image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7", amenities: ["Heritage", "Mountain View", "Restaurant", "Rooftop"] },
        { name: "The Druk Ladakh", location: "Leh", type: "Hotel", rating: 4.5, price: 7500, image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c", amenities: ["Mountain View", "Restaurant", "Garden", "Bar"] },
        { name: "Chamba Camp Thiksey", location: "Thiksey", type: "Luxury Camp", rating: 4.8, price: 18000, image: "https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904", amenities: ["Luxury Tents", "Mountain View", "Fine Dining", "Cultural Tours"] },
        { name: "Nimmu House", location: "Nimmu", type: "Heritage Homestay", rating: 4.6, price: 6500, image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461", amenities: ["Heritage", "River View", "Organic Food", "Cultural Experience"] },
        { name: "The Indus Valley", location: "Leh", type: "Resort", rating: 4.4, price: 7000, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", amenities: ["Mountain View", "Restaurant", "Garden", "Adventure"] },
        { name: "Hotel Omasila", location: "Leh", type: "Boutique Hotel", rating: 4.3, price: 5500, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d", amenities: ["Mountain View", "Restaurant", "Rooftop", "Garden"] },
        { name: "Ladakh Sarai Resort", location: "Leh", type: "Resort", rating: 4.5, price: 8500, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945", amenities: ["Mountain View", "Restaurant", "Garden", "Cultural Shows"] },
        { name: "Hotel Yak Tail", location: "Leh", type: "Hotel", rating: 4.2, price: 4500, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", amenities: ["Mountain View", "Restaurant", "Budget Friendly", "Clean Rooms"] }
    ],
    "Srinagar": [
        { name: "The Khyber Himalayan Resort", location: "Gulmarg Road", type: "Mountain Resort", rating: 5.0, price: 25800, image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272", amenities: ["Mountain Views", "Ski Access", "Spa", "Fine Dining"] },
        { name: "Vivanta Dal View", location: "Dal Lake", type: "Luxury Hotel", rating: 4.8, price: 18000, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", amenities: ["Lake View", "Spa", "Restaurant", "Garden"] },
        { name: "The LaLiT Grand Palace", location: "Gupkar Road", type: "Heritage Palace", rating: 4.9, price: 22000, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4", amenities: ["Palace", "Lake View", "Heritage", "Spa"] },
        { name: "Houseboat Sukoon", location: "Dal Lake", type: "Houseboat", rating: 4.7, price: 12000, image: "https://images.unsplash.com/photo-1596436889106-be35e843f974", amenities: ["Houseboat", "Lake View", "Shikara Ride", "Traditional Food"] },
        { name: "Hotel Hilltop", location: "Nishat", type: "Hotel", rating: 4.4, price: 7000, image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7", amenities: ["Lake View", "Garden", "Restaurant", "Parking"] },
        { name: "WelcomHeritage Gurkha Houseboats", location: "Dal Lake", type: "Houseboat", rating: 4.6, price: 10000, image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c", amenities: ["Houseboat", "Lake View", "Heritage", "Kashmiri Cuisine"] },
        { name: "The Chinar at The LaLiT", location: "Gupkar Road", type: "Luxury Hotel", rating: 4.7, price: 16000, image: "https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904", amenities: ["Lake View", "Spa", "Restaurant", "Garden"] },
        { name: "Hotel Pine Spring", location: "Gulmarg", type: "Mountain Hotel", rating: 4.5, price: 9000, image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461", amenities: ["Mountain View", "Ski Access", "Restaurant", "Bonfire"] },
        { name: "Radisson Srinagar", location: "Rajbagh", type: "Hotel", rating: 4.6, price: 11000, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", amenities: ["Lake View", "Pool", "Spa", "Restaurant"] },
        { name: "Fortune Resort Heevan", location: "Gulmarg", type: "Resort", rating: 4.4, price: 8500, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d", amenities: ["Mountain View", "Restaurant", "Spa", "Adventure"] }
    ],
    "Coorg": [
        { name: "The Tamara Coorg", location: "Yevakapadi", type: "Luxury Resort", rating: 4.9, price: 19800, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", amenities: ["Plantation Walk", "Infinite Pool", "Spa", "Fine Dining"] },
        { name: "Evolve Back Coorg", location: "Karadigodu", type: "Heritage Resort", rating: 4.8, price: 22000, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945", amenities: ["Private Pool Villas", "Spa", "Plantation", "Wildlife"] },
        { name: "Taj Madikeri Resort", location: "Madikeri", type: "Luxury Resort", rating: 4.7, price: 16000, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d", amenities: ["Rainforest", "Spa", "Pool", "Restaurant"] },
        { name: "The Ibnii", location: "Madikeri", type: "Eco Resort", rating: 4.6, price: 14000, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", amenities: ["Eco-Friendly", "Plantation", "Pool", "Organic Food"] },
        { name: "Amanvana Spa Resort", location: "Kushalnagar", type: "Spa Resort", rating: 4.5, price: 12000, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", amenities: ["River View", "Spa", "Cottages", "Adventure"] },
        { name: "Coorg Cliffs Resort", location: "Madikeri", type: "Resort", rating: 4.4, price: 9000, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4", amenities: ["Valley View", "Pool", "Restaurant", "Trekking"] },
        { name: "The Windflower Resort", location: "Madikeri", type: "Boutique Resort", rating: 4.6, price: 11000, image: "https://images.unsplash.com/photo-1596436889106-be35e843f974", amenities: ["Plantation", "Spa", "Pool", "Restaurant"] },
        { name: "Old Kent Estates", location: "Virajpet", type: "Plantation Stay", rating: 4.5, price: 10000, image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7", amenities: ["Coffee Estate", "Heritage", "Nature Walks", "Bonfire"] },
        { name: "Purple Palms Resort", location: "Siddapur", type: "Resort", rating: 4.3, price: 7500, image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c", amenities: ["River View", "Pool", "Restaurant", "Adventure"] },
        { name: "Coorg Wilderness Resort", location: "Galibeedu", type: "Wildlife Resort", rating: 4.4, price: 8500, image: "https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904", amenities: ["Wildlife", "Nature", "Trekking", "Bonfire"] }
    ],
    "Wayanad": [
        { name: "Vythiri Resort", location: "Vythiri", type: "Rainforest Resort", rating: 4.7, price: 12000, image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461", amenities: ["Rainforest", "Treehouse", "Pool", "Spa"] },
        { name: "AfterTheRains Resort", location: "Lakkidi", type: "Eco Resort", rating: 4.6, price: 10000, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", amenities: ["Eco-Friendly", "Rainforest", "Organic Food", "Nature Walks"] },
        { name: "Tranquil Resort", location: "Kalpetta", type: "Resort", rating: 4.5, price: 8500, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d", amenities: ["Mountain View", "Pool", "Restaurant", "Spa"] },
        { name: "The Woods Resorts", location: "Meppadi", type: "Nature Resort", rating: 4.4, price: 7500, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945", amenities: ["Forest", "Cottages", "Bonfire", "Trekking"] },
        { name: "Pepper Trail", location: "Vythiri", type: "Plantation Stay", rating: 4.6, price: 9500, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", amenities: ["Spice Plantation", "Nature", "Organic Food", "Trekking"] },
        { name: "Banasura Hill Resort", location: "Vellamunda", type: "Eco Resort", rating: 4.7, price: 11000, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", amenities: ["Earth Homes", "Eco-Friendly", "Lake View", "Organic"] },
        { name: "Sterling Wayanad", location: "Vythiri", type: "Resort", rating: 4.3, price: 7000, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4", amenities: ["Mountain View", "Pool", "Activities", "Restaurant"] },
        { name: "Arayal Resorts", location: "Wayanad", type: "Treehouse Resort", rating: 4.5, price: 9000, image: "https://images.unsplash.com/photo-1596436889106-be35e843f974", amenities: ["Treehouse", "Nature", "Pool", "Restaurant"] },
        { name: "The Windflower Resort", location: "Vythiri", type: "Spa Resort", rating: 4.4, price: 8000, image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7", amenities: ["Spa", "Pool", "Rainforest", "Restaurant"] },
        { name: "Sharoy Resort", location: "Kalpetta", type: "Resort", rating: 4.2, price: 6000, image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c", amenities: ["Mountain View", "Pool", "Restaurant", "Garden"] }
    ],
    "Jaipur": [
        { name: "Rambagh Palace", location: "Bhawani Singh Road", type: "Heritage Palace", rating: 5.0, price: 72000, image: "https://images.unsplash.com/photo-1590611380053-da643716d82b", amenities: ["Royal Gardens", "Heritage Decor", "Spa", "Fine Dining"] },
        { name: "Taj Jai Mahal Palace", location: "Jacob Road", type: "Heritage Palace", rating: 4.9, price: 35000, image: "https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904", amenities: ["Mughal Gardens", "Palace", "Pool", "Spa"] },
        { name: "The Oberoi Rajvilas", location: "Goner Road", type: "Luxury Resort", rating: 5.0, price: 45000, image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461", amenities: ["Private Villas", "Spa", "Pool", "Fine Dining"] },
        { name: "Fairmont Jaipur", location: "Kukas", type: "Luxury Hotel", rating: 4.8, price: 28000, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", amenities: ["Palace Architecture", "Pool", "Spa", "Golf"] },
        { name: "Samode Palace", location: "Samode", type: "Heritage Palace", rating: 4.7, price: 22000, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d", amenities: ["Heritage", "Royal Decor", "Pool", "Cultural Shows"] },
        { name: "Alsisar Haveli", location: "Sansar Chandra Road", type: "Heritage Haveli", rating: 4.6, price: 12000, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945", amenities: ["Heritage", "Pool", "Restaurant", "Cultural"] },
        { name: "Trident Jaipur", location: "Amber Fort Road", type: "Hotel", rating: 4.5, price: 10000, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", amenities: ["Fort View", "Pool", "Spa", "Restaurant"] },
        { name: "Radisson Blu Jaipur", location: "City Square Mall", type: "Hotel", rating: 4.4, price: 8500, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", amenities: ["City View", "Pool", "Spa", "Restaurant"] },
        { name: "Hilton Jaipur", location: "Jagatpura", type: "Hotel", rating: 4.5, price: 9000, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4", amenities: ["Modern", "Pool", "Spa", "Restaurant"] },
        { name: "Crowne Plaza Jaipur", location: "Tonk Road", type: "Hotel", rating: 4.3, price: 7500, image: "https://images.unsplash.com/photo-1596436889106-be35e843f974", amenities: ["City View", "Pool", "Restaurant", "Bar"] }
    ],
    "Varanasi": [
        { name: "BrijRama Palace", location: "Darbhanga Ghat", type: "Heritage Palace", rating: 4.9, price: 24500, image: "https://images.unsplash.com/photo-1561224737-268153600bef", amenities: ["Ganges River View", "Historic Palace", "Spa", "Rooftop Dining"] },
        { name: "Taj Ganges", location: "Nadesar Palace Grounds", type: "Luxury Hotel", rating: 4.7, price: 18000, image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7", amenities: ["Garden", "Pool", "Spa", "Restaurant"] },
        { name: "Radisson Hotel Varanasi", location: "The Mall", type: "Hotel", rating: 4.5, price: 12000, image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c", amenities: ["Modern", "Pool", "Spa", "Restaurant"] },
        { name: "Ramada Plaza JHV", location: "Sigra", type: "Hotel", rating: 4.4, price: 9000, image: "https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904", amenities: ["City View", "Pool", "Restaurant", "Bar"] },
        { name: "Gateway Hotel Ganges", location: "Raja Bazar Road", type: "Hotel", rating: 4.6, price: 11000, image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461", amenities: ["Ganges View", "Pool", "Spa", "Restaurant"] },
        { name: "Suryauday Haveli", location: "Shivala Ghat", type: "Heritage Haveli", rating: 4.5, price: 10000, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", amenities: ["Ganges View", "Heritage", "Rooftop", "Restaurant"] },
        { name: "Ganges View Hotel", location: "Assi Ghat", type: "Boutique Hotel", rating: 4.3, price: 7000, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d", amenities: ["Ganges View", "Rooftop", "Restaurant", "Yoga"] },
        { name: "Hotel Surya", location: "The Mall", type: "Hotel", rating: 4.2, price: 6000, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945", amenities: ["City View", "Restaurant", "Clean Rooms", "Parking"] },
        { name: "Madin Hotel", location: "Godowlia", type: "Hotel", rating: 4.1, price: 5000, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", amenities: ["Central Location", "Restaurant", "Budget Friendly", "Clean"] },
        { name: "Hotel Meraden Grand", location: "Cantonment", type: "Hotel", rating: 4.4, price: 8000, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", amenities: ["Modern", "Pool", "Restaurant", "Spa"] }
    ]
};

const hotelInsert = db.prepare(`
    INSERT INTO hotels (name, location, city, type, rating, price, image, amenities)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

console.log('Adding hotels to all cities...\n');

let totalAdded = 0;

for (const [city, hotels] of Object.entries(allCityHotels)) {
    console.log(`\n📍 ${city}:`);
    let cityCount = 0;

    hotels.forEach(hotel => {
        try {
            hotelInsert.run(
                hotel.name,
                hotel.location,
                city,
                hotel.type,
                hotel.rating,
                hotel.price,
                hotel.image,
                JSON.stringify(hotel.amenities)
            );
            console.log(`  ✓ ${hotel.name}`);
            cityCount++;
            totalAdded++;
        } catch (err) {
            console.error(`  ✗ Error adding ${hotel.name}:`, err.message);
        }
    });

    const totalInCity = db.prepare('SELECT COUNT(*) as count FROM hotels WHERE city = ?').get(city);
    console.log(`  → Total hotels in ${city}: ${totalInCity.count}`);
}

console.log(`\n✅ Successfully added ${totalAdded} hotels across all cities!`);

const totalHotels = db.prepare('SELECT COUNT(*) as count FROM hotels').get();
console.log(`📊 Total hotels in database: ${totalHotels.count}`);

db.close();
