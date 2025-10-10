// Vercel Serverless Function to send SMS via Infobip

export default async function handler(request, response) {
    // We only accept POST requests to this endpoint
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Method Not Allowed' });
    }

    const { to, text, sender } = request.body;

    // Basic validation
    if (!to || !text || !sender) {
        return response.status(400).json({ message: 'Missing required fields: to, text, sender' });
    }

    // --- DANGER: Hardcoded secret keys ---
    // This is not secure. It's better to use Environment Variables.
    const apiKey = "a92653d3c0999e1e8534179a660e4137-de0ee46d-52e1-43af-8020-1acabc11278e";
    
    // Using the correct global API endpoint that was tested and works.
    const baseUrl = "api.infobip.com";

    if (!apiKey || !baseUrl) {
        console.error('Server configuration error: Missing Infobip environment variables.');
        return response.status(500).json({ message: 'Server configuration error.' });
    }

    const infobipUrl = `https://${baseUrl}/sms/2/text/advanced`;

    const payload = {
        messages: [
            {
                destinations: [{ to: to }],
                from: sender,
                text: text,
            },
        ],
    };

    try {
        const infobipResponse = await fetch(infobipUrl, {
            method: 'POST',
            headers: {
                'Authorization': `App ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await infobipResponse.json();

        if (infobipResponse.ok) {
            console.log('SMS sent successfully:', data);
            return response.status(200).json({ success: true, data });
        } else {
            console.error('Infobip API Error:', data);
            return response.status(infobipResponse.status).json({ success: false, error: data });
        }
    } catch (error) {
        console.error('Internal Server Error:', error);
        return response.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
}

