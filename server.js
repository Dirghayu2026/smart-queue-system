const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json());

// --- Firebase Admin SDK Initialization ---
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// --- API Route to Send Notification ---
app.post('/notify-student', async (req, res) => {
    const { fcmToken, studentName } = req.body;

    if (!fcmToken) {
        return res.status(400).send({ error: "No token found for this student." });
    }

    const message = {
        notification: {
            title: "Your Turn! 📢",
            body: `Hello ${studentName}, please proceed to the office for your task.`
        },
        token: fcmToken // User registration veles save kelelya token var message jail
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("Notification sent successfully:", response);
        res.status(200).send({ success: true, message: "Notification Sent!" });
    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).send({ success: false, error: error.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});