import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
        },
        capacity: {
            type: Number,
            required: true, // in sq ft
        },
        usedCapacity: {
            type: Number,
            default: 0,
        },
        manager: {
            type: String,
            required: true,
        },
        contact: {
            type: String,
            required: true,
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
        city: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'City',
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },
        type: {
            type: String,
            default: 'General',
        },
        products: [{
            type: String,
        }],
        establishedDate: {
            type: Date,
        },
        coordinates: {
            lat: Number,
            lng: Number,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Warehouse', warehouseSchema);
