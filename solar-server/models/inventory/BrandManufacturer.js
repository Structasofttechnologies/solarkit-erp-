import mongoose from 'mongoose';

const brandManufacturerSchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: true,
            trim: true,
        },
        companyOriginCountry: {
            type: String,
            required: true,
            trim: true,
        },
        brand: {
            type: String, // This could be a reference if "Brand" entity is strict, but based on frontend it's text input
            required: true,
            trim: true,
        },
        brandLogo: {
            type: String, // Base64 string or URL
            default: null,
        },
        product: {
            type: String,
            required: true,
            trim: true,
        },
        comboKit: {
            type: Boolean,
            default: false,
        },
        // Location Fields (Only for India, but good to have structure)
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            default: null,
        },
        city: { // Replacing 'district' in some contexts, or additional hierarchy. Using 'City' as per instruction.
            type: mongoose.Schema.Types.ObjectId,
            ref: 'City',
            default: null,
        },
        district: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District',
            default: null,
        },
        // For "Other" countries, they might not have these IDs, so loose validation there.

        isActive: { // Status toggle
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('BrandManufacturer', brandManufacturerSchema);
