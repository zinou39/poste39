const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.error("Twilio credentials not found in environment variables.");
}

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.post('/make-call', (req, res) => {
  const { to, message } = req.body;
  if (!to) {
    return res.status(400).json({ success: false, message: 'Phone number is required.' });
  }
  const twiml = new twilio.twiml.VoiceResponse();
  
  // -- التعديل --
  // تم تحديد الصوت بشكل صريح لضمان التشغيل الصحيح
  twiml.say({ language: 'ar-SA', voice: 'woman' }, message || 'مرحباً، لديك إشعار من مكتب البريد.');

  client.calls
    .create({
      twiml: twiml.toString(),
      to: to,
      from: process.env.TWILIO_PHONE_NUMBER,
    })
    .then(call => {
      res.status(200).json({ success: true, message: `Calling ${to}`, callSid: call.sid });
    })
    .catch(error => {
      console.error("Twilio Error:", error); // تسجيل الخطأ لمزيد من التفاصيل
      res.status(500).json({ success: false, message: 'Failed to make call.', error: error.message });
    });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Server is listening on port ' + listener.address().port);
});

