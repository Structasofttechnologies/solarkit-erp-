import mongoose from 'mongoose';

const customizedComboKitSchema = new mongoose.Schema({
    originalComboKitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SolarKit'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Modified products or BOM
    customizations: {
        products: [String],
        bomUpdates: [{
            originalItemId: String, // If tracking specific items
            newItemName: String,
            quantity: Number,
            price: Number
        }]
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'Pending' // Pending, Approved, etc.
    }
}, { timestamps: true });

export default mongoose.model('CustomizedComboKit', customizedComboKitSchema);
