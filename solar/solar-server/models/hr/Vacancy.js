import mongoose from 'mongoose';

const vacancySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    position: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true,
        default: 1
    },
    experience: {
        type: String,
        default: ''
    },
    skills: [{
        type: String
    }],
    education: {
        type: String,
        default: ''
    },
    certifications: {
        type: String,
        default: ''
    },
    deadline: {
        type: Date
    },
    jobType: {
        type: String,
        enum: ['fulltime', 'parttime', 'contract', 'internship'],
        default: 'fulltime'
    },
    description: {
        type: String,
        default: ''
    },
    responsibilities: {
        type: String,
        default: ''
    },
    salary: {
        type: String,
        default: ''
    },
    joiningDate: {
        type: Date
    },

    // Location Scope
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State'
    },
    cluster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cluster'
    },
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
    },
    cities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
    }],

    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });

export default mongoose.model('Vacancy', vacancySchema);
