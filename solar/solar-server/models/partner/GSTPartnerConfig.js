import mongoose from 'mongoose';

const gstPartnerConfigSchema = new mongoose.Schema(
    {
        businessType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BusinessType',
            required: [true, 'Business type is required']
        },
        partnerTypes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Partner'
        }],
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// One config per business type
gstPartnerConfigSchema.index({ businessType: 1 }, { unique: true });

export default mongoose.model('GSTPartnerConfig', gstPartnerConfigSchema);
