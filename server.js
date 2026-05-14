const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

// 🔴 Firebase Setup
try {
    const serviceAccount = require("./serviceAccountKey.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Connected");
} catch (e) {
    console.log("❌ Firebase Key Error: ", e.message);
}

const db = admin.firestore();

// 🔴 Twilio Setup
const accountSid = 'AC6948ca769baf497ecfb7c80f8725e647'; 
const authToken = '81a1e2ab9ae9838ab1662664dc4ce27f';   
const twilioNumber = '+15715967277'; 
const client = new twilio(accountSid, authToken);

// युजर रजिस्ट्रेशन API
app.post('/api/register', async (req, res) => {
    try {
        console.log("📩 Received Data:", req.body); // Render Logs मध्ये हे दिसेल
        const { name, phone, purpose } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ success: false, error: "नाव आणि नंबर आवश्यक आहे" });
        }

        const snapshot = await db.collection('queue').orderBy('token', 'desc').limit(1).get();
        let nextToken = 101;
        if (!snapshot.empty) {
            nextToken = snapshot.docs[0].data().token + 1;
        }

        const student = {
            name,
            phone,
            purpose: purpose || "General",
            token: nextToken,
            status: 'waiting',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('queue').add(student);
        console.log(`✅ Token ${nextToken} saved to Firebase`);

        // SMS (Optional - जर Twilio नसेल तर हा भाग कमेंट करा)
        client.messages.create({
            body: `Hi ${name}, your Token is #${nextToken}.`,
            from: twilioNumber,
            to: phone
        }).catch(e => console.log("SMS Error: ", e.message));

        res.json({ success: true, token: nextToken });
    } catch (err) {
        console.error("❌ API Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// कॉल स्टुडंट API
app.post('/api/call-student', async (req, res) => {
    try {
        const { id, phone, name, token } = req.body;
        await db.collection('queue').doc(id).update({ status: 'serving' });

        client.calls.create({
            twiml: `<Response><Say voice="alice">Hello ${name}, Token ${token}, please come.</Say></Response>`,
            from: twilioNumber,
            to: phone
        }).catch(e => console.log("Call Error: ", e.message));

        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/queue', async (req, res) => {
    const snap = await db.collection('queue').where('status', '==', 'waiting').orderBy('timestamp', 'asc').get();
    let q = [];
    snap.forEach(doc => q.push({ id: doc.id, ...doc.data() }));
    res.json(q);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Port ${PORT} live`));