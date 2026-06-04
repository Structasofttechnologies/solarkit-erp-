import mongoose from 'mongoose';

const buyLeadSettingLeadSchema = new mongoose.Schema({
    settingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BuyLeadSetting',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    isAssigned: {
        type: Boolean,
        default: false
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const BuyLeadSettingLead = mongoose.model('BuyLeadSettingLead', buyLeadSettingLeadSchema);

export default BuyLeadSettingLead;
