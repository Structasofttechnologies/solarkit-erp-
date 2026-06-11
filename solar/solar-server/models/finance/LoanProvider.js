import mongoose from 'mongoose';

const loanProviderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const LoanProvider = mongoose.model('LoanProvider', loanProviderSchema);

export default LoanProvider;
