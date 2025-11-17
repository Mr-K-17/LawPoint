import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    case_type: { type: String, required: true },
    case_description: { type: String, required: true },
    urgency: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    registration_date: { type: Date, default: Date.now },
    profile_updated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Client', clientSchema);