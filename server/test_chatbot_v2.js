import fetch from 'node-fetch';

async function testChatbot() {
    const queries = [
        "Who are you?",
        "Tell me about festivals",
        "Hotels in Pushkar",
        "Sonepur Mela info",
        "Something random"
    ];

    for (const q of queries) {
        try {
            const res = await fetch('http://localhost:3000/api/chatbot/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: q })
            });
            const data = await res.json();
            console.log(`Q: ${q}`);
            console.log(`A: ${data.response}`);
            console.log('---');
        } catch (err) {
            console.error(`Error for query "${q}":`, err.message);
        }
    }
}

testChatbot();
