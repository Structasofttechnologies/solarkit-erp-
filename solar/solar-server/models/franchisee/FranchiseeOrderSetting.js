import mongoose from 'mongoose';

const franchiseeOrderSettingSchema = new mongoose.Schema(
    {
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            required: true
        },
        settingType: {
            type: String,
            enum: ['combokit', 'customize'],
            required: true
        },
        planType: { // startup, basic, enterprise, solar
            type: String,
            required: true
        },
        // Items will ideally be linked to actual Products/Combokits from their respective collections.
        // For this module, we are storing the configuration.
        itemId: { // Combokit ID or "CustomKitID" string
            type: String,
            required: true
        },
        itemName: {
            type: String
        },
        district: {
            type: String
        },
        cluster: {
            type: String
        },
        category: String,
        subCategory: String,
        projectType: String,
        subProjectType: String,

        orderQty: {
            type: Number,
            default: 0
        },
        discountPerKw: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('FranchiseeOrderSetting', franchiseeOrderSettingSchema);
