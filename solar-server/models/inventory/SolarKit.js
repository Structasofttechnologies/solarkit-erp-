import mongoose from 'mongoose';

const solarKitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country',
        required: true
    },
    products: [{
        type: String
    }],
    category: {
        type: String,
        default: 'Solar Panel'
    },
    subCategory: {
        type: String,
        default: 'Residential'
    },
    projectType: {
        type: String,
        default: '1kW - 10kW'
    },
    subProjectType: {
        type: String,
        default: 'On Grid'
    },
    bom: [{
        bosKitName: String,
        kitType: {
            type: String,
            enum: ['CP', 'Combokit'],
            default: 'Combokit'
        },
        kitCategory: String,
        items: [{
            name: String,
            itemType: String,
            qty: String,
            unit: String,
            price: Number
        }]
    }],
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Inactive'
    }
}, {
    timestamps: true,
});

const SolarKit = mongoose.model('SolarKit', solarKitSchema);

export default SolarKit;
