import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lawyer', required: true },
    caseType: { type: String, required: true },
    caseDescription: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);