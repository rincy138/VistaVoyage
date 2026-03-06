import fetch from 'node-fetch';

async function checkApi() {
    const ports = [3000, 5000, 5173]; // Try various potential ports
    for (const port of ports) {
        try {
            console.log(`Checking port ${port}...`);
            const response = await fetch(`http://localhost:${port}/api/festivals/upcoming`);
            if (response.ok) {
                const data = await response.json();
                console.log(`SUCCESS on port ${port}:`);
                console.log(JSON.stringify(data, null, 2));
                return;
            }
            console.log(`Port ${port} returned status ${response.status}`);
        } catch (err) {
            console.log(`Port ${port} failed: ${err.message}`);
        }
    }
}

checkApi();
