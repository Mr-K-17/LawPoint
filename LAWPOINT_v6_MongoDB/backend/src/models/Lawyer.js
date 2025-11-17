import mongoose from 'mongoose';

const lawyerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    specialization: [{ type: String }],
    experience_years: { type: Number, required: true },
    total_cases: { type: Number, default: 0 },
    cases_won: { type: Number, default: 0 },
    cases_lost: { type: Number, default: 0 },
    success_rate: { type: Number, default: 0 },
    average_rate: { type: Number, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    location: { type: String, required: true },
    bar_council_id: { type: String, required: true, unique: true },
    bio: { type: String, default: '' },
    achievements: [{ type: String }],
    availability: { type: String, enum: ['Available', 'Busy', 'Offline'], default: 'Available' }
}, { timestamps: true });

export default mongoose.model('Lawyer', lawyerSchema);