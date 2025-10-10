/**
 * Vercel Serverless Function to send an SMS via Infobip.
 * This function acts as a secure backend proxy.
 */
export default async function handler(request, response) {
    // Only allow POST requests
    if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    // --- New Account Information ---
    // WARNING: Storing secrets directly in code is NOT recommended for production.
    // It's better to use Vercel Environment Variables.
    const INFOBIP_API_KEY = "de21342e37e74606847425d420cf2f0d-096270d3-9fcf-41c4-b177-4e30f4198c74";
    const INFOBIP_BASE_URL = "jjln59.api.infobip.com";
    
    const { to, text, sender } = request.body;

    // Basic validation
    if (!to || !text || !sender) {
        response.status(400).json({ error: 'Missing required fields: to, text, sender' });
        return;
    }

    /**
     * Formats an Algerian phone number to the international E.164 standard.
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
        return cleaned;
    }

    const formattedTo = formatPhoneNumber(to);

    const apiRequestBody = {
        messages: [
            {
                destinations: [{ to: formattedTo }],
                from: sender,
                text: text,
            },
        ],
    };

    try {
        const infobipResponse = await fetch(`https://${INFOBIP_BASE_URL}/sms/2/text/advanced`, {
            method: 'POST',
            headers: {
                'Authorization': `App ${INFOBIP_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(apiRequestBody),
        });

        const responseData = await infobipResponse.json();

        if (infobipResponse.ok) {
            // Forward the successful response from Infobip to the client
            response.status(200).json(responseData);
        } else {
            // Forward the error response from Infobip to the client
            console.error('Infobip API Error:', responseData);
            response.status(infobipResponse.status).json({ error: responseData });
        }
    } catch (error) {
        console.error('Internal Server Error:', error);
        response.status(500).json({ error: 'Failed to send SMS due to an internal server error.' });
    }
}

