import mongoose from 'mongoose';

const solarInstallerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        type: String,
        required: true,
        trim: true
    },
    licenseNumber: {
        type: String,
        required: true,
        trim: true
    },
    experience: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
        required: true
    },
    cluster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cluster',
        required: true
    },
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District',
        required: true
    },
    ratings: [{
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InstallerRating',
            required: true
        },
        value: {
            type: Number,
            min: 0,
            max: 5,
            required: true
        }
    }],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    }
}, {
    timestamps: true
});

const SolarInstaller = mongoose.model('SolarInstaller', solarInstallerSchema);
export default SolarInstaller;
