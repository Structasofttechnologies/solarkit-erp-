import mongoose from 'mongoose';

const companyMarginSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            unique: true,
            enum: ['Prime', 'Regular', 'Other']
        },
        cost: {
            type: Number,
            required: true,
            default: 0
        },
        margin: {
            type: Number,
            required: true,
            default: 0
        },
        minOrders: {
            type: Number,
            default: 0
        },
        percentageMargin: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

// Auto-calculate total before saving
companyMarginSchema.pre('save', function (next) {
    this.total = (this.cost || 0) + (this.margin || 0);
    next();
});

export default mongoose.model('CompanyMargin', companyMarginSchema);
