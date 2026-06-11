import mongoose from 'mongoose';

const deliveryBenchmarkPriceSchema = new mongoose.Schema(
    {
        deliveryType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DeliveryType',
            required: true,
        },
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            // required: true, // Optional based on specific implementation if it can be global
        },
        cluster: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cluster',
        },
        district: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District',
        },
        category: {
            type: String,
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
        combokit: {
            type: String, // Storing name or ID based on what the frontend passes
        },
        benchmarkPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    { timestamps: true }
);

// We drop the old unique index that restricted one price per delivery type.
// A new compound index could be added later if needed, but for now we allow multiple.

export default mongoose.model('DeliveryBenchmarkPrice', deliveryBenchmarkPriceSchema);
