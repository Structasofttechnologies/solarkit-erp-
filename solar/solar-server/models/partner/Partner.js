import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true }, // e.g., 'Dealer', 'Franchisee', 'Channel Partner'
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Partner', partnerSchema);
