import express from 'express';
import Lawyer from '../models/Lawyer.js';

const router = express.Router();

// Get all lawyers
router.get('/', async(req, res) => {
    try {
        const lawyers = await Lawyer.find();
        res.json({ success: true, lawyers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single lawyer by ID
router.get('/:id', async(req, res) => {
    try {
        const lawyer = await Lawyer.findById(req.params.id);
        if (!lawyer) return res.status(404).json({ success: false, message: 'Lawyer not found' });
        res.json({ success: true, lawyer });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update lawyer profile
router.put('/:id', async(req, res) => {
    try {
        const updates = req.body;
        const lawyer = await Lawyer.findByIdAndUpdate(req.params.id, updates, { new: true });
        res.json({ success: true, lawyer });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;