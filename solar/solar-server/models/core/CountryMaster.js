import mongoose from 'mongoose';

const countryMasterSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        flag: {
            type: String,
            default: '',
        },
        currency: {
            type: String,
            default: '',
        },
        currencySymbol: {
            type: String,
            default: '',
        },
        phoneCode: {
            type: String,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('CountryMaster', countryMasterSchema);
