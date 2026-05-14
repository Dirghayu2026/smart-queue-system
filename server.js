const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

// 🔴 FIREBASE SETUP
// तुमची serviceAccountKey.json फाईल या सर्व्हरच्या सेम फोल्डरमध्ये ठेवा
try {
    const serviceAccount = require("./serviceAccountKey.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Connected Successfully");
} catch (e) {
    console.log("❌ Firebase Initialization Error: ", e.message);
}

const db = admin.firestore();

// 🔴 TWILIO SETUP (तुमचे क्रेडेंशियल्स इथे टाका)
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID'; 
const authToken = 'YOUR_TWILIO_AUTH_TOKEN';   
const twilioNumber = 'YOUR_TWILIO_PHONE_NUMBER'; 
const client = new twilio(accountSid, authToken);

// १. विद्यार्थी नोंदणी API
app.post('/api/register', async (req, res) => {
    try {
        console.log("📩 Received Registration:", req.body);
        const { name, phone, purpose } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ success: false, error: "Name and Phone are required" });
        }

        // शेवटचा टोकन नंबर शोधून +1 करणे
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
        
        // ॲडमिन डॅशबोर्डवरील लॉगसाठी नोंद
        await db.collection('logs').add({
            time: new Date().toLocaleTimeString(),
            action: 'JOINED',
            detail: `${nextToken} - ${name} (${phone})`,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: true, token: nextToken });
    } catch (err) {
        console.error("❌ Registration Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// २. रिअल-टाईम व्हॉईस कॉल API (ॲडमिन पॅनेलवरून ट्रिगर होईल)
app.post('/api/call-student', async (req, res) => {
    try {
        const { id, phone, name, token } = req.body;
        console.log(`📞 Initiating Twilio Call to ${name} (${phone})`);

        // क्यु मधील स्टेटस बदलणे
        await db.collection('queue').doc(id).update({ status: 'serving' });
        
        // लाईव्ह स्टेटस अपडेट (currentServing)
        await db.collection('meta').doc('currentServing').set({ token: token });

        // Activity Log मध्ये नोंदणी
        await db.collection('logs').add({
            time: new Date().toLocaleTimeString(),
            action: 'CALLED',
            detail: `Token ${token} (${name}) called to counter.`,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        // 📱 Twilio Voice Call Logic
        if (phone) {
            // जर नंबरमध्ये +91 नसेल तर तो जोडणे
            const formattedPhone = phone.startsWith('+') ? phone : '+91' + phone;
            
            await client.calls.create({
                twiml: `<Response>
                            <Say voice="alice">Hello ${name}. Your token number ${token} is being called. Please proceed to the counter immediately. Thank you.</Say>
                        </Response>`,
                from: twilioNumber,
                to: formattedPhone
            });
            console.log("📲 Twilio Call Triggered Successfully");
        }

        res.json({ success: true });
    } catch (err) {
        console.error("❌ Twilio Call Error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ३. सर्व्हिस पूर्ण झाल्यावर क्लियर करणे
app.post('/api/complete-student', async (req, res) => {
    try {
        const { id, token } = req.body;
        await db.collection('queue').doc(id).delete();
        await db.collection('meta').doc('currentServing').delete();
        
        await db.collection('logs').add({
            time: new Date().toLocaleTimeString(),
            action: 'COMPLETED',
            detail: `Token ${token} service finished.`,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Queue Server Running on Port ${PORT}`));