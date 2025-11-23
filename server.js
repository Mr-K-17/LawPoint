// -----------------------------------------
// server.js — FIXED + RENDER READY
// -----------------------------------------

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { MongoClient, ServerApiVersion } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// -----------------------------------------
// 1. Load MongoDB URI safely from .env
// -----------------------------------------
if (!process.env.MONGODB_URI) {
    console.error("❌ ERROR: MONGODB_URI is missing in .env");
    process.exit(1);
}

const uri = process.env.MONGODB_URI;

// Mask password for terminal logs
const maskedUri = uri.replace(/:(?:[^:@]+)@/, ":<password>@");

// MongoDB client options
const clientOptions = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    connectTimeoutMS: 20000,
    serverSelectionTimeoutMS: 20000,
};

const client = new MongoClient(uri, clientOptions);
let db = null;

// -----------------------------------------
// 2. Connect to MongoDB
// -----------------------------------------
async function connectDB() {
    try {
        console.log("Attempting MongoDB Connection:", maskedUri);
        await client.connect();
        db = client.db("lawpoint_db");
        console.log("✅ Successfully connected to MongoDB!");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        process.exit(1);
    }
}

// -----------------------------------------
// 3. Start the server after DB connection
// -----------------------------------------
async function startServer() {
    await connectDB();

    // -----------------------------------------
    // API ENDPOINTS (untouched — same as provided)
    // -----------------------------------------

    // Fetch initial data
    app.get("/api/initial-data", async(req, res) => {
        try {
            const collections = ["clients", "lawyers", "cases", "chats", "requests", "posts"];
            const result = {};

            for (const col of collections) {
                result[col] = await db.collection(col).find({}).toArray();
            }

            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Register user
    app.post("/api/register", async(req, res) => {
        try {
            const { user, role } = req.body;
            const collection = role === "client" ? "clients" : "lawyers";

            const result = await db.collection(collection).insertOne(user);
            res.json({ success: true, result });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Delete user
    app.delete("/api/users", async(req, res) => {
        try {
            const { id, role } = req.body;
            const collection = role === "client" ? "clients" : "lawyers";

            await db.collection(collection).deleteOne({ id });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Update user
    app.post("/api/update-user", async(req, res) => {
        try {
            const { user, role } = req.body;
            const collection = role === "client" ? "clients" : "lawyers";

            await db.collection(collection).updateOne({ id: user.id }, { $set: user });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Requests
    app.post("/api/requests", async(req, res) => {
        try {
            await db.collection("requests").insertOne(req.body);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.patch("/api/requests/:id", async(req, res) => {
        try {
            await db.collection("requests").updateOne({ id: req.params.id }, { $set: { status: req.body.status } });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Cases
    app.post("/api/cases", async(req, res) => {
        try {
            await db.collection("cases").insertOne(req.body);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.patch("/api/cases/:id", async(req, res) => {
        try {
            await db.collection("cases").updateOne({ id: req.params.id }, { $set: req.body });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Chat messages
    app.post("/api/messages", async(req, res) => {
        try {
            const { chatId, message } = req.body;

            await db.collection("chats").updateOne({ id: chatId }, { $push: { messages: message } });

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // New chat
    app.post("/api/chats", async(req, res) => {
        try {
            await db.collection("chats").insertOne(req.body);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Posts
    app.post("/api/posts", async(req, res) => {
        try {
            await db.collection("posts").insertOne(req.body);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.patch("/api/posts/:id", async(req, res) => {
        try {
            await db.collection("posts").updateOne({ id: req.params.id }, { $set: req.body });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.delete("/api/posts/:id", async(req, res) => {
        try {
            await db.collection("posts").deleteOne({ id: req.params.id });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // -----------------------------------------
    // SERVE FRONTEND (dist/)
    // -----------------------------------------
    const __filename = fileURLToPath(
        import.meta.url);
    const __dirname = path.dirname(__filename);

    const distPath = path.join(__dirname, "dist");

    // Serve built frontend
    app.use(express.static(distPath));

    // Fallback for SPA
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });

    // -----------------------------------------
    // Start server
    // -----------------------------------------
    const server = app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGINT", async() => {
        console.log("🔌 Closing MongoDB...");
        await client.close();
        server.close(() => process.exit(0));
    });

    process.on("SIGTERM", async() => {
        console.log("🔌 Closing MongoDB...");
        await client.close();
        server.close(() => process.exit(0));
    });
}

startServer();