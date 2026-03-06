import fetch from 'node-fetch';

async function verifyApi() {
    try {
        const port = process.env.PORT || 3000;
        const res = await fetch(`http://localhost:${port}/api/festivals/upcoming`);
        const data = await res.json();
        console.log("API RETURNED:", data.length, "festivals");
        data.forEach(f => {
            console.log(`- ${f.name}: ${f.image_url}`);
        });
    } catch (err) {
        console.error("API Error:", err.message);
    }
}

verifyApi();
