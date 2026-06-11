import mongoose from 'mongoose';

const dealerKycSchema = new mongoose.Schema(
    {
        dealer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        dealerManager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        aadharNumber: { type: String },
        aadharDoc: { type: String },
        panNumber: { type: String },
        panDoc: { type: String },
        gstNumber: { type: String },
        gstDoc: { type: String },
        udhyogNumber: { type: String },
        udhyogDoc: { type: String },
        photoDoc: { type: String },
        signatureDoc: { type: String },
        cancelledChqDoc: { type: String },
        remark: { type: String },
        kycStatus: {
            type: String,
            enum: ['Not Done', 'Pending', 'Done', 'Rejected'],
            default: 'Not Done'
        }
    },
    { timestamps: true }
);

export default mongoose.model('DealerKYC', dealerKycSchema);
