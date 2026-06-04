import mongoose from 'mongoose';

const placeholderNameSchema = new mongoose.Schema({
    labelKey: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    labelValue: {
        type: String,
        default: ''
    },
    dbField: {
        type: String,
        default: '' // Mapping to Project model field name
    },
    number: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
});

const PlaceholderName = mongoose.model('PlaceholderName', placeholderNameSchema);

export default PlaceholderName;
