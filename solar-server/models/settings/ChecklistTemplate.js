import mongoose from 'mongoose';

const checklistItemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    required: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
});

const checklistTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
        required: true
    },
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District',
        required: true
    },
    cluster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cluster',
        required: true
    },
    items: [checklistItemSchema],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    completionStatus: {
        type: String,
        enum: ['completed', 'pending'],
        default: 'pending'
    },
    manualStatus: {
        type: String,
        enum: ['pending', 'completed', 'high-priority'],
        default: 'pending'
    },
    category: {
        type: String,
        trim: true
    },
    iconName: {
        type: String, // lucide icon name
        default: 'ClipboardList'
    },
    iconBg: {
        type: String, // Tailwind class e.g. 'bg-blue-100 text-blue-600'
        default: 'bg-blue-100 text-blue-600'
    }
}, {
    timestamps: true
});

// Compound unique index to allow same name across different categories and regions
checklistTemplateSchema.index({ name: 1, cluster: 1, category: 1 }, { unique: true });

const ChecklistTemplate = mongoose.model('ChecklistTemplate', checklistTemplateSchema);

export default ChecklistTemplate;
