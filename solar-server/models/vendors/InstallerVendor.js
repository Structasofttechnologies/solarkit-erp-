import mongoose from 'mongoose';

const installerVendorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        contact: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
        },
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
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
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },
        ratings: [{
            category: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'InstallerRating',
                required: true
            },
            value: {
                type: Number,
                min: 0,
                max: 5,
                required: true
            }
        }],
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('InstallerVendor', installerVendorSchema);
