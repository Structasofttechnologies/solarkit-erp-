import mongoose from 'mongoose';

const quoteSettingsSchema = new mongoose.Schema({
    proposalNo: {
        type: String,
        unique: true
    },
    countries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
    }],
    states: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State'
    }],
    clusters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cluster'
    }],
    districts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
    }],
    categories: [String],
    subCategories: [String],
    projectTypes: [String],
    subProjectTypes: [String],
    quoteTypes: [String],
    partnerTypes: [String],
    planTypes: [String],
    solarSettings: {
        projectKW: { type: Number, default: 0 },
        unitPerKW: { type: Number, default: 0 }
    },
    monthlyIsolation: [{
        month: String,
        isolation: Number,
        total: Number
    }],
    selectedPages: [String],
    allPages: [{
        id: String,
        label: String,
        value: String,
        description: String
    }],
    colorSettings: {
        brandColor: { type: Boolean, default: false },
        backgroundColor: { type: Boolean, default: false },
        pageSequence: { type: Boolean, default: false },
        pageOrder: [String]
    },
    fieldSettings: {
        proposalNo: { type: Boolean, default: true },
        customerName: { type: Boolean, default: true },
        kwRequired: { type: Boolean, default: true },
        residentialCommercial: { type: Boolean, default: true },
        city: { type: Boolean, default: true },
        preparedBy: { type: Boolean, default: true },
        date: { type: Boolean, default: true },
        validUpto: { type: Boolean, default: true },
        quoteType: { type: Boolean, default: true },
        productImage: { type: Boolean, default: true },
        totalCost: { type: Boolean, default: true },
        govtMnreSubsidy: { type: Boolean, default: true },
        govtStateSubsidy: { type: Boolean, default: true },
        additionalCharges: { type: Boolean, default: true },
        finalTotal: { type: Boolean, default: true }
    },
    kitTypes: [String],
    paymentModes: [String],
    generationSummary: {
        type: Boolean,
        default: true
    },
    pageConfigs: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    frontPageSettings: {
        header: {
            showLogo: { type: Boolean, default: true },
            showName: { type: Boolean, default: true },
            showTagline: { type: Boolean, default: true },
            showContact: { type: Boolean, default: true },
            showEmail: { type: Boolean, default: true },
            showWebsite: { type: Boolean, default: true },
            showAddress: { type: Boolean, default: true },
            logoUrl: String,
            alignment: { type: String, default: 'Left' },
            bgColor: { type: String, default: '#ffffff' },
            textColor: { type: String, default: '#000000' }
        },
        banner: {
            imageUrl: String,
            overlayOpacity: { type: Number, default: 0.4 },
            textColor: { type: String, default: '#ffffff' }
        },
        contentVisibility: {
            proposalTitle: { type: Boolean, default: true },
            customTitle: String,
            customerName: { type: Boolean, default: true },
            proposalNo: { type: Boolean, default: true },
            quoteDate: { type: Boolean, default: true },
            validUpto: { type: Boolean, default: true },
            city: { type: Boolean, default: true },
            systemSize: { type: Boolean, default: true },
            categoryType: { type: Boolean, default: true },
            partnerName: { type: Boolean, default: true }
        },
        customText: {
            welcomeMsg: String,
            introDesc: String,
            promoText: String,
            notes: String
        },
        footer: {
            showFooterLogo: { type: Boolean, default: true },
            showName: { type: Boolean, default: true },
            showAddress: { type: Boolean, default: true },
            showMobile: { type: Boolean, default: true },
            showEmail: { type: Boolean, default: true },
            showWebsite: { type: Boolean, default: true },
            showGst: { type: Boolean, default: true },
            showSocials: { type: Boolean, default: true },
            showCopyright: { type: Boolean, default: true },
            showPageNo: { type: Boolean, default: true },
            noteText: String,
            copyrightText: String,
            bgColor: { type: String, default: '#f8f9fa' },
            textColor: { type: String, default: '#6c757d' },
            alignment: { type: String, default: 'Center' },
            layout: { type: String, default: 'Center Align' }
        },
        styling: {
            themeColor: { type: String, default: '#2563eb' },
            fontFamily: { type: String, default: 'Inter' },
            fontSize: { type: String, default: '14px' },
            bgColor: { type: String, default: '#ffffff' },
            spacing: { type: String, default: '20px' },
            alignment: { type: String, default: 'Center' }
        }
    },
    advancedOptions: [{
        key: { type: String }, // 'amc', 'insurance', etc.
        enabled: { type: Boolean, default: false },
        type: { type: String },
        price: { type: Number, default: 0 },
        description: { type: String }
    }],
    unitPrice: {
        type: Number,
        default: 7.5
    },
    packageImage: {
        type: String
    },
    bomData: {
        items: [{ label: String, value: String }],
        pipes: [{ panels: String, kw: String, size1: String, size2: String }],
        heightNote: { type: String }
    },
    monthlyIsolation: [{
        month: String,
        isolation: Number,
        total: Number
    }],
    pricingData: {
        totalCost: { type: Number, default: 0 },
        mnreSubsidy: { type: Number, default: 0 },
        stateSubsidy: { type: Number, default: 0 },
        additionalCharges: { type: Number, default: 0 },
        netCost: { type: Number, default: 0 }
    },
    inflationRate: { type: Number, default: 0 },
    degradationRate: { type: Number, default: 0 },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model('QuoteSettings', quoteSettingsSchema);
