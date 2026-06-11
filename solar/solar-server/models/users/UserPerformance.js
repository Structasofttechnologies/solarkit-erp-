import mongoose from 'mongoose';

const userPerformanceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            required: true,
        },
        countryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Country',
            default: null,
        },
        stateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            default: null,
        },
        districtId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District',
            default: null,
        },
        clusterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cluster',
            default: null,
        },
        sales: {
            type: Number,
            default: 0,
        },
        leads: {
            type: Number,
            default: 0,
        },
        demos: {
            type: Number,
            default: 0,
        },
        signups: {
            type: Number,
            default: 0,
        },
        conversions: {
            type: Number,
            default: 0,
        },
        target: {
            type: Number,
            default: 0,
        },
        achieved: {
            type: Number,
            default: 0,
        },
        performancePercent: {
            type: Number,
            default: 0,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['Performer', 'Active', 'Inactive'],
            default: 'Active',
        },
        orderKW: {
            type: Number,
            default: 0
        },
        orderRs: {
            type: Number,
            default: 0
        },
        workingDays: {
            type: Number,
            default: 0
        },
        absentDays: {
            type: Number,
            default: 0
        },
        efficiency: {
            type: Number,
            default: 0
        },
        productivity: {
            type: Number,
            default: 0
        },
        overdueTasks: {
            type: Number,
            default: 0
        }
    },

    { timestamps: true }
);

export default mongoose.model('UserPerformance', userPerformanceSchema);
