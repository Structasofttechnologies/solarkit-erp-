import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
    {
        itemName: {
            type: String,
            required: true,
            trim: true,
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BrandManufacturer',
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        subCategory: {
            type: String,
        },
        projectType: {
            type: String,
        },
        subProjectType: {
            type: String,
        },
        kitType: {
            type: String,
        },
        productType: {
            type: String,
        },
        technology: {
            type: String,
        },
        wattage: {
            type: Number,
        },
        sku: {
            type: String,
            required: true,
            trim: true
        },
        quantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            default: 0,
        },
        minLevel: {
            type: Number,
            default: 0, // Low stock threshold
        },
        maxLevel: {
            type: Number,
            default: 1000,
        },
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            required: true,
        },
        cluster: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cluster',
            required: true,
        },
        district: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District',
            required: true,
        },
        city: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'City',
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        dealerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Index for getting items by location
inventoryItemSchema.index({ state: 1, city: 1, district: 1 });
// Compound index to ensure unique SKU per location (Cluster level or District level? Assuming District/Cluster is fine-grained)
// Adjust based on business logic. If stock is per District, check SKU+District. If per Cluster, SKU+Cluster.
// Assuming smallest unit is District+Cluster or just Warehouse?
// The payload sends State, Cluster, District.
inventoryItemSchema.index({ sku: 1, state: 1, cluster: 1, district: 1 }, { unique: true });
// Index for searching
inventoryItemSchema.index({ itemName: 'text', sku: 'text' });

export default mongoose.model('InventoryItem', inventoryItemSchema);
