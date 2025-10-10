// Vercel Serverless Function to send SMS via Infobip (Secure Version with Phone Formatting)

/**
 * Formats an Algerian phone number to the international E.164 standard.
 * Example: 0712345678 -> 213712345678
 * @param {string} phone The phone number to format.
 * @returns {string} The formatted phone number.
 */
function formatPhoneNumber(phone) {
    if (!phone) return '';
    let cleaned = phone.replace(/[\s-]/g, ''); // Remove spaces and dashes
    if (cleaned.startsWith('0')) {
        return '213' + cleaned.substring(1);
    }
    if (cleaned.startsWith('+213')) {
        return cleaned.substring(1);
    }
    return cleaned; // Assume it's already in the correct format if it doesn't start with 0
}


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

    // Securely read API key and URL from Vercel Environment Variables
    const apiKey = process.env.INFOBIP_API_KEY;
    const baseUrl = process.env.INFOBIP_BASE_URL;

    if (!apiKey || !baseUrl) {
        console.error('Server configuration error: Missing Infobip environment variables.');
        // Do not expose detailed errors to the client
        return response.status(500).json({ message: 'Server configuration error.' });
    }

    const infobipUrl = `https://${baseUrl}/sms/2/text/advanced`;
    
    // Format the phone number before sending
    const formattedPhoneNumber = formatPhoneNumber(to);

    const payload = {
        messages: [
            {
                destinations: [{ to: formattedPhoneNumber }],
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

