import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lawyer', required: true },
    caseType: { type: String, required: true },
    caseDescription: { type: String, required: true },
    status: { type: String, enum: ['In Progress', 'Pending', 'Resolved'], default: 'In Progress' },
    acceptedDate: { type: Date, default: Date.now },
    notes: [{
        id: String,
        title: String,
        content: String,
        timestamp: Date,
        updated: Date
    }]
}, { timestamps: true });

export default mongoose.model('Case', caseSchema);