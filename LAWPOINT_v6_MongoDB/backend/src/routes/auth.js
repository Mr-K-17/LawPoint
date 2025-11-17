import express from 'express';
import Client from '../models/Client.js';
import Lawyer from '../models/Lawyer.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Client Register
router.post('/client/register', async(req, res) => {
    try {
        const { username, email, phone, password, name, case_type, case_description, urgency } = req.body;
        const existingClient = await Client.findOne({ $or: [{ username }, { email }] });
        if (existingClient) {
            return res.status(400).json({ success: false, message: 'Username or email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const client = new Client({ username, email, phone, password: hashedPassword, name, case_type, case_description, urgency: urgency || 'Medium' });
        await client.save();
        const token = jwt.sign({ id: client._id, type: 'client' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ success: true, message: 'Client registered successfully', token, client: { id: client._id, name: client.name, email: client.email } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Client Login
router.post('/client/login', async(req, res) => {
    try {
        const { username, password } = req.body;
        const client = await Client.findOne({ username });
        if (!client) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        const isPasswordValid = await bcrypt.compare(password, client.password);
        if (!isPasswordValid) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        const token = jwt.sign({ id: client._id, type: 'client' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, client: { id: client._id, name: client.name, email: client.email } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Lawyer Register
router.post('/lawyer/register', async(req, res) => {
    try {
        const { name, email, phone, password, bar_council_id, experience_years, location } = req.body;
        const existingLawyer = await Lawyer.findOne({ $or: [{ email }, { bar_council_id }] });
        if (existingLawyer) return res.status(400).json({ success: false, message: 'Email or Bar Council ID already exists' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const lawyer = new Lawyer({ name, email, phone, password: hashedPassword, bar_council_id, experience_years: parseInt(experience_years), location, specialization: ['Criminal Defense'], average_rate: 5000 });
        await lawyer.save();
        const token = jwt.sign({ id: lawyer._id, type: 'lawyer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ success: true, message: 'Lawyer registered successfully', token, lawyer: { id: lawyer._id, name: lawyer.name, email: lawyer.email } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Lawyer Login
router.post('/lawyer/login', async(req, res) => {
    try {
        const { email, password } = req.body;
        const lawyer = await Lawyer.findOne({ email });
        if (!lawyer) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        const isPasswordValid = await bcrypt.compare(password, lawyer.password);
        if (!isPasswordValid) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        const token = jwt.sign({ id: lawyer._id, type: 'lawyer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, lawyer: { id: lawyer._id, name: lawyer.name, email: lawyer.email } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;