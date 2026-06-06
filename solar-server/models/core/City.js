import mongoose from 'mongoose';

const citySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
        },
        zone: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Zone',
            required: true,
        },
        cluster: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cluster',
            required: true,
        },
        district: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District',
            required: true,
        },
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            required: true,
        },
        country: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Country',
            required: true,
        },
        areaType: {
            type: String,
            enum: ['Urban', 'Rural'],
            default: 'Urban',
        },
        pincodes: [{
            type: String,
            trim: true,
        }],
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for unique city per zone and area type
citySchema.index({ name: 1, zone: 1, areaType: 1 }, { unique: true });

export default mongoose.model('City', citySchema);
