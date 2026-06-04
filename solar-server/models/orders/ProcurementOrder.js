import mongoose from 'mongoose';

const procurementOrderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SupplierVendor',
            required: false // Optional for stock entry
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: false // Optional for stock entry
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            enum: ['Pending', 'Order Raised', 'Vendor Selected', 'Approval by Admin', 'Payment Done', 'In Transit', 'Delivered', 'Approved', 'Completed', 'Cancelled'],
            default: 'Pending'
        },
        // Location Data (from Setup Locations)
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            required: false // Optional for stock entry
        },
        city: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'City',
            required: false // Optional for stock entry
        },
        district: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District',
            required: false // Optional for stock entry
        },
        // New fields for scalable tracking persistence
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InventoryItem'
        },
        brand: String, 
        watt: String,
        technology: String,
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

export default mongoose.model('ProcurementOrder', procurementOrderSchema);
