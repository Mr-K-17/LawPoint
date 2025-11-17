import express from 'express';
import Client from '../models/Client.js';

const router = express.Router();

// Get client details by ID
router.get('/:id', async(req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
        res.json({ success: true, client });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update client profile
router.put('/:id', async(req, res) => {
    try {
        const updates = req.body;
        const client = await Client.findByIdAndUpdate(req.params.id, updates, { new: true });
        res.json({ success: true, client });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;