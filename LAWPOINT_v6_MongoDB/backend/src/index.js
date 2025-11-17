import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import lawyersRoutes from './routes/lawyers.js';
import clientsRoutes from './routes/clients.js';
import requestsRoutes from './routes/requests.js';
import casesRoutes from './routes/cases.js';
import newsRoutes from './routes/news.js';

dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: '✅ LAW POINT Backend is running on MongoDB!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/lawyers', lawyersRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/news', newsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   LAW POINT Backend with MongoDB       ║
║                                        ║
║  🚀 Server running on port ${PORT}     ║
║  📍 http://localhost:${PORT}           ║
║  🗄️  MongoDB Connected                 ║
║  ⚖️  All routes ready                   ║
║                                        ║
╚════════════════════════════════════════╝
  `);
});

export default app;