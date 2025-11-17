import express from 'express';
import Case from '../models/Case.js';

const router = express.Router();

// Get all cases
router.get('/', async(req, res) => {
    try {
        const cases = await Case.find().populate('clientId').populate('lawyerId');
        res.json({ success: true, cases });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update case status
router.put('/:id/status', async(req, res) => {
    try {
        const { status } = req.body;
        const updatedCase = await Case.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json({ success: true, case: updatedCase });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add a note to case
router.post('/:id/notes', async(req, res) => {
    try {
        const { title, content } = req.body;
        const updatedCase = await Case.findByIdAndUpdate(
            req.params.id, {
                $push: {
                    notes: {
                        id: Date.now().toString(),
                        title,
                        content,
                        timestamp: new Date(),
                        updated: new Date()
                    }
                }
            }, { new: true }
        );
        res.json({ success: true, case: updatedCase });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;