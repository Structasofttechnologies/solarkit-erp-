import mongoose from 'mongoose';

const overdueStatusSettingSchema = new mongoose.Schema({
    countries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Country', index: true }],
    states: [{ type: mongoose.Schema.Types.ObjectId, ref: 'State', index: true }],
    clusters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cluster', index: true }],
    districts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'District', index: true }],
    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true }],
    positions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role', index: true }], 
    
    // Legacy support (optional, but keeping it flexible)
    department: String,
    state: String,
    city: String,

    modules: [{
        id: mongoose.Schema.Types.Mixed,
        name: String,
        overdueDays: Number,
        status: { type: String, default: "Active" },
        tasks: [{
            id: mongoose.Schema.Types.Mixed,
            name: String,
            overdueDays: Number,
            status: { type: String, default: "Active" }
        }]
    }],
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const OverdueStatusSetting = mongoose.model('OverdueStatusSetting', overdueStatusSettingSchema);
export default OverdueStatusSetting;
