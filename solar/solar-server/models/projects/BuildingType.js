import mongoose from 'mongoose';

const buildingTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    floorLimit: {
        type: Number,
        default: null // Only for 'Flat' or similar types if needed
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model('BuildingType', buildingTypeSchema);
