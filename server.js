import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { MongoClient, ServerApiVersion } from 'mongodb';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Build MongoDB URI: prefer full MONGODB_URI, otherwise compose from password.
const buildUri = () => {
    if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
    if (!process.env.MONGODB_PASSWORD) {
        console.warn('No MONGODB_URI or MONGODB_PASSWORD provided — connection will likely fail.');
    }
    const pwd = process.env.MONGODB_PASSWORD ? encodeURIComponent(process.env.MONGODB_PASSWORD) : '<password_not_set>';
    return `mongodb+srv://kishoresathyagala_db_user:${pwd}@lawpoint.mlyx6nz.mongodb.net/lawpoint_db?retryWrites=true&w=majority`;
};

const uri = buildUri();

// Masked URI for logs (don't print actual password)
const maskedUri = uri.replace(/:(?:[^:@]+)@/, ':<password>@');

const clientOptions = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
};

// Optional: allow insecure TLS for debugging (DO NOT USE IN PRODUCTION)
if (process.env.TLS_INSECURE === 'true') {
    clientOptions.tlsAllowInvalidCertificates = true;
    clientOptions.tlsInsecure = true;
    console.warn('TLS insecure mode is ON (tlsAllowInvalidCertificates=true)');
}

const client = new MongoClient(uri, clientOptions);

let db = null;

async function connectDB() {
    try {
        console.log('Attempting MongoDB connection to', maskedUri);
        await client.connect();
        db = client.db('lawpoint_db');
        console.log('Successfully connected to MongoDB!');
    } catch (error) {
        console.error('MongoDB connection failed:', error && error.message ? error.message : error);
        console.error('Suggestions:');
        console.error('- Verify `MONGODB_URI` or `MONGODB_PASSWORD` in your .env');
        console.error('- If using Atlas, ensure your IP is whitelisted in Network Access');
        console.error('- If connection still fails, copy the full connection string from Atlas and set `MONGODB_URI`');
        throw error;
    }
}

// Start server only after DB connection
async function startServer() {
    try {
        await connectDB();

        // --- API Endpoints ---

        app.get('/api/initial-data', async(req, res) => {
            try {
                if (!db) return res.status(500).json({ error: 'Database not connected' });
                const clients = await db.collection('clients').find({}).toArray();
                const lawyers = await db.collection('lawyers').find({}).toArray();
                const cases = await db.collection('cases').find({}).toArray();
                const chats = await db.collection('chats').find({}).toArray();
                const requests = await db.collection('requests').find({}).toArray();
                const posts = await db.collection('posts').find({}).toArray();
                res.json({ clients, lawyers, cases, chats, requests, posts });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        app.post('/api/register', async(req, res) => {
            try {
                const { user, role } = req.body;
                const collection = role === 'client' ? 'clients' : 'lawyers';
                const result = await db.collection(collection).insertOne(user);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        app.delete('/api/users', async(req, res) => {
            try {
                const { id, role } = req.body;
                const collection = role === 'client' ? 'clients' : 'lawyers';
                await db.collection(collection).deleteOne({ id });
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        app.post('/api/update-user', async(req, res) => {
            try {
                const { user, role } = req.body;
                const collection = role === 'client' ? 'clients' : 'lawyers';
                await db.collection(collection).updateOne({ id: user.id }, { $set: user });
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        app.post('/api/requests', async(req, res) => {
            try {
                await db.collection('requests').insertOne(req.body);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        app.patch('/api/requests/:id', async(req, res) => {
            try {
                const { status } = req.body;
                await db.collection('requests').updateOne({ id: req.params.id }, { $set: { status } });
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        app.post('/api/cases', async(req, res) => {
            try {
                await db.collection('cases').insertOne(req.body);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        app.patch('/api/cases/:id', async(req, res) => {
            try {
                const updateData = req.body;
                await db.collection('cases').updateOne({ id: req.params.id }, { $set: updateData });
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        app.post('/api/messages', async(req, res) => {
            try {
                const { chatId, message } = req.body;
                const chat = await db.collection('chats').findOne({ id: chatId });
                if (chat) {
                    await db.collection('chats').updateOne({ id: chatId }, { $push: { messages: message } });
                }
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        app.post('/api/chats', async(req, res) => {
            try {
                await db.collection('chats').insertOne(req.body);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        app.post('/api/posts', async(req, res) => {
            try {
                await db.collection('posts').insertOne(req.body);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        app.patch('/api/posts/:id', async(req, res) => {
            try {
                const updateData = req.body;
                await db.collection('posts').updateOne({ id: req.params.id }, { $set: updateData });
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        app.delete('/api/posts/:id', async(req, res) => {
            try {
                await db.collection('posts').deleteOne({ id: req.params.id });
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        const server = app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

        // Graceful shutdown
        const graceful = async() => {
            console.log('Shutting down gracefully...');
            await client.close();
            server.close(() => process.exit(0));
        };

        process.on('SIGINT', graceful);
        process.on('SIGTERM', graceful);

    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

startServer();