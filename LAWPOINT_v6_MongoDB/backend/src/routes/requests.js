import express from 'express';
import Request from '../models/Request.js';
import Case from '../models/Case.js';

const router = express.Router();

// Create a new request
router.post('/', async(req, res) => {
    try {
        const { clientId, lawyerId, caseType, caseDescription } = req.body;
        const request = new Request({ clientId, lawyerId, caseType, caseDescription });
        await request.save();
        res.status(201).json({ success: true, request });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all requests
router.get('/', async(req, res) => {
    try {
        const requests = await Request.find().populate('clientId').populate('lawyerId');
        res.json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Accept a request and create a case
router.put('/:id/accept', async(req, res) => {
    try {
        const request = await Request.findByIdAndUpdate(req.params.id, { status: 'accepted' }, { new: true });
        const newCase = new Case({
            clientId: request.clientId,
            lawyerId: request.lawyerId,
            caseType: request.caseType,
            caseDescription: request.caseDescription,
            status: 'In Progress'
        });
        await newCase.save();
        res.json({ success: true, request, case: newCase });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Reject a request
router.put('/:id/reject', async(req, res) => {
    try {
        const request = await Request.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
        res.json({ success: true, request });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;