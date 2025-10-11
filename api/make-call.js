// Use CommonJS syntax that Vercel's Node.js environment expects by default
const fetch = require('node-fetch');

module.exports = async (request, response) => {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const PUSHOVER_USER_KEY = process.env.PUSHOVER_USER_KEY;
    const PUSHOVER_API_TOKEN = process.env.PUSHOVER_API_TOKEN;

    if (!PUSHOVER_USER_KEY || !PUSHOVER_API_TOKEN) {
        console.error("Missing Pushover environment variables");
        return response.status(500).json({ error: 'Server configuration error.' });
    }
    
    // Vercel parses the body automatically if it's JSON
    const { to, text } = request.body;

    if (!to || !text) {
        return response.status(400).json({ error: 'Missing required fields: to, text' });
    }

    const notificationBody = `call_request ${text}`;
    
    try {
        const pushoverResponse = await fetch("https://api.pushover.net/1/messages.json", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: PUSHOVER_API_TOKEN,
                user: PUSHOVER_USER_KEY,
                title: to,
                message: notificationBody,
                sound: 'pushover',
                priority: 0
            }),
        });

        const responseData = await pushoverResponse.json();

        if (pushoverResponse.ok && responseData.status === 1) {
            response.status(200).json({ message: "Notification sent to phone successfully." });
        } else {
            console.error('Pushover API Error:', responseData);
            response.status(pushoverResponse.status).json({ error: responseData.errors || 'Failed to send notification.' });
        }
    } catch (error) {
        console.error('Internal Server Error:', error);
        response.status(500).json({ error: 'Failed to send notification due to an internal server error.' });
    }
};

