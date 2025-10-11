/**

* Vercel Serverless Function to send a Pushover notification.

* This notification will then trigger a MacroDroid macro on the phone.

*/

export default async function handler(request, response) {

if (request.method !== 'POST') {

return response.status(405).json({ error: 'Method Not Allowed' });

}



// --- Securely get secrets from Vercel Environment Variables ---

const PUSHOVER_USER_KEY = process.env.PUSHOVER_USER_KEY;

const PUSHOVER_API_TOKEN = process.env.PUSHOVER_API_TOKEN;



if (!PUSHOVER_USER_KEY || !PUSHOVER_API_TOKEN) {

console.error("Missing Pushover environment variables");

return response.status(500).json({ error: 'Server configuration error.' });

}


const { to, text } = request.body;



if (!to || !text) {

return response.status(400).json({ error: 'Missing required fields: to, text' });

}



// We will send the phone number as the notification's title

// and the message text as the notification's body.

// We add a keyword to the message to ensure only this macro is triggered.

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

title: to, // Phone number in the title

message: notificationBody, // Message text in the body

sound: 'pushover', // optional: a default sound

priority: 0 // optional: normal priority

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

}
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


