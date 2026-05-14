const express = require("express");
const cors = require("cors");
const twilio = require("twilio");

const app = express();

app.use(cors());
app.use(express.json());

const accountSid = "AC6948ca769baf497ecfb7c80f8725e647";
const authToken = "81a1e2ab9ae9838ab1662664dc4ce27f";

const client = twilio(accountSid, authToken);

// CALL USER
app.post("/call-user", async (req, res) => {

    try {

        const phone = req.body.phone;

        const call = await client.calls.create({

            twiml: `
                <Response>
                    <Say voice="alice">
                        Your turn has arrived.
                        Please come to the counter now.
                    </Say>
                </Response>
            `,

            to: phone,

            from: "YOUR_TWILIO_NUMBER"
        });

        res.json({
            success: true,
            sid: call.sid
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});