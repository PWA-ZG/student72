import express from "express";
import multer from "multer";
import webpush from "web-push";
import { pool } from "./db/pool.js";

const app = express();
const upload = multer();

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const PORT = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 8080;

app.use(express.json());

app.use(express.static("public"));

app.get("/screenshots/:username", async (req, res) => {
    try {
        const username = req.params.username;
        const result = await pool.query("SELECT username, ts, notes, image_data FROM screenshots WHERE username = $1", [
            username,
        ]);

        const screenshots = result.rows.map((row) => ({
            username: row.username,
            ts: row.ts,
            notes: row.notes,
            image_data: row.image_data.toString("base64"),
        }));

        res.setHeader("Content-Type", "application/json");
        res.send(screenshots);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/screenshots", upload.single("image"), async (req, res) => {
    try {
        const { id, username, ts, notes } = req.body;
        const imageBuffer = req.file.buffer;

        await pool.query({
            text: "INSERT INTO screenshots (username, ts, notes, image_data) VALUES ($1, $2, $3, $4)",
            values: [username, ts, notes, imageBuffer],
        });

        await sendPushNotifications(username);
        res.json({ id: id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/subscriptions", async (req, res) => {
    try {
        const subscription = req.body.sub;
        await pool.query("INSERT INTO subscriptions (subscription) VALUES ($1)", [subscription]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

async function sendPushNotifications(username) {
    webpush.setVapidDetails(
        "mailto:vr53601@fer.hr",
        "BAZyl7YhytrkbLcm4HiiXAZrSbiTKRfY7PN6dddIkjfPDOnRmHCzXpgUIIYlzdf_MiqnwVViWww_g9ocM89-B9E",
        "-jp24cu-4k1TUlesCJjzwLem-okoH2CqeqwoQ0fGd1Q"
    );

    let subscriptions = (await pool.query("SELECT * FROM subscriptions")).rows;

    subscriptions.forEach(async (sub) => {
        try {
            await webpush.sendNotification(
                sub.subscription,
                JSON.stringify({
                    title: "New screenshot!",
                    body: username + " just uploaded a new screenshot!",
                    redirectUrl: "/collection.html?username=" + username,
                })
            );
        } catch (error) {
            console.error(error);
        }
    });
}

app.listen(PORT, () => {
    console.log("Server running on " + PORT);
});
