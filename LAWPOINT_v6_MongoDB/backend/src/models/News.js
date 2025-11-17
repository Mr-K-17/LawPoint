import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['Court Update', 'Investigation', 'Case Study', 'Legal Reform'], required: true },
    date: { type: Date, default: Date.now },
    source: { type: String, required: true },
    icon: { type: String, default: '📰' },
    content: String,
    ai_generated: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('News', newsSchema);