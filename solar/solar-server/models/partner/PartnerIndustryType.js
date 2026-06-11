import mongoose from 'mongoose';

const partnerIndustryTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        partnerType: {
            type: String,
            required: true,
            index: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('PartnerIndustryType', partnerIndustryTypeSchema);
