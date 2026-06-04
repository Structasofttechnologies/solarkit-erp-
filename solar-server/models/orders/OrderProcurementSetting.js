import mongoose from 'mongoose';

const skuItemSchema = new mongoose.Schema({
    minRange: {
        type: Number,
        required: true,
        min: 0
    },
    maxRange: {
        type: Number,
        required: true,
        min: 0
    },
    assignModules: [String],
    supplierType: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SupplierType',
        required: true
    }]
});

const orderProcurementSettingSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: [true, 'Please select a category']
        },
        subCategory: {
            type: String,
            required: [true, 'Please select a sub-category']
        },
        projectType: {
            type: String,
            required: [true, 'Please select a project type']
        },
        subProjectType: {
            type: String,
            required: [true, 'Please select a sub-project type']
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Please select a product']
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BrandManufacturer',
            required: [true, 'Please select a brand']
        },
        paymentType: [{
            type: String,
            enum: ['Cash', 'Loan', 'EMI', 'None']
        }],
        skuSelectionOption: {
            type: String,
            enum: ['ComboKit', 'Customize'],
            required: [true, 'Please select a SKU selection option'],
            default: 'ComboKit'
        },
        skus: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SKU'
        }],
        skuItems: [skuItemSchema],
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State'
        },
        cluster: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cluster'
        },
        warehouse: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Warehouse'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

export default mongoose.model('OrderProcurementSetting', orderProcurementSettingSchema);
