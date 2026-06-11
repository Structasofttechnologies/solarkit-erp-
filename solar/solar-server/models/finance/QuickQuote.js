import mongoose from 'mongoose';

const quickQuoteSchema = new mongoose.Schema({
    quoteNumber: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },

    // Additional Details
    date: {
        type: String
    },
    time: {
        type: String
    },
    remark: {
        type: String
    },

    // Core Location & Metadata (Populated in API)
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory'
    },
    projectType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectType'
    },
    subProjectType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubProjectType'
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BrandManufacturer'
    },
    technology: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Technology'
    },
    solarPanelWatt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Kilowatt'
    },
    numberOfSolarPanel: {
        type: Number
    },
    kilowatt: {
        type: Number
    },

    // Kit Selection Details
    kitType: {
        type: String,
        enum: ['Combo Kit', 'Customize Kit'],
        required: true
    },
    comboKit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ComboKitAssignment'
    },

    // Customize Kit Details
    solarPanel: { type: String },
    solarInverter: { type: String },
    bosKit: { type: String },

    // Kit Image
    image: { type: String },

    // Payment & Loan
    paymentType: {
        type: String,
        enum: ['Cash File', 'Loan File'],
        required: true
    },
    loanType: {
        type: String,
        enum: ['NBFC Loan', 'Bank Loan', 'None'],
        default: 'None'
    },

    // Charges & Margins
    channelPartnerCharge: { type: Number, default: 0 },
    terraceType: { type: mongoose.Schema.Types.ObjectId, ref: 'TerraceType' },
    structureCharge: { type: Number, default: 0 },
    installationCharge: { type: Number, default: 0 },
    agentMarginCommission: { type: Number, default: 0 },
    companyMargin: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },

    // Financial Totals
    subTotal: { type: Number, required: true },
    gst: { type: Number, required: true },

    roundOff: {
        type: Number,
        default: 0
    },
    grandTotal: { type: Number, required: true },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }
}, { timestamps: true });

// Auto-generate quoteNumber
quickQuoteSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const date = new Date();
            const year = date.getFullYear();

            // Find the last quote created in the current year
            const lastQuote = await this.constructor.findOne(
                { quoteNumber: new RegExp(`^#QT-${year}-`) },
                { quoteNumber: 1 },
                { sort: { createdAt: -1 } }
            );

            let sequenceNumber = 1;
            if (lastQuote && lastQuote.quoteNumber) {
                const parts = lastQuote.quoteNumber.split('-');
                if (parts.length === 3) {
                    sequenceNumber = parseInt(parts[2], 10) + 1;
                }
            }

            // Format as #QT-YYYY-XXX (e.g. #QT-2026-001)
            const formattedSequence = sequenceNumber.toString().padStart(3, '0');
            this.quoteNumber = `#QT-${year}-${formattedSequence}`;

            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

export default mongoose.model('QuickQuote', quickQuoteSchema);
