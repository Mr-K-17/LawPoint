import express from 'express';
import News from '../models/News.js';

const router = express.Router();

// Get all news
router.get('/', async(req, res) => {
    try {
        const news = await News.find().sort({ date: -1 });
        res.json({ success: true, news });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create news item
router.post('/', async(req, res) => {
    try {
        const { title, description, category, source, icon, content, ai_generated } = req.body;
        const news = new News({ title, description, category, source, icon, content, ai_generated });
        await news.save();
        res.status(201).json({ success: true, news });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;