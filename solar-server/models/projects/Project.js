import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    entityType: {
      type: String,
      enum: ['company', 'partners', 'installer-agency'],
      default: 'company',
      required: true
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String, // e.g., 'Residential', 'Commercial', 'Industrial'
      required: true,
      trim: true,
    },
    subCategory: { // e.g. 'Solar Panel', 'Solar Rooftop'
      type: String,
      trim: true
    },
    projectType: {
      type: String, // e.g., 'On-Grid', 'Off-Grid', 'Hybrid'
      required: true,
      trim: true,
    },
    subProjectType: { // e.g. 'Above 100Kw' ?
      type: String,
      trim: true
    },
    totalKW: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    commission: {
      type: Number,
      default: 0
    },
    commissionStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Completed'], // 'Completed' might be same as 'Paid' or just finalized
      default: 'Pending'
    },
    status: {
      type: String,
      required: true,
      default: 'Consumer Registered', // Default starting status?
      // enum? 'Consumer Registered', 'Application Submission', 'Feasibility Check', 'Work Start', 'Vendor Selection', 'PCR', 'Commissioning', 'Meter Change'
    },
    statusStage: {
      type: String, // machine friendly status key
      // enum? 'consumer', 'application', 'feasibility', 'work', 'vendor', 'pcr', 'commission', 'meterchange'
    },
    currentStep: {
      type: Number,
      default: 1
    },
    dueDate: {
      type: Date,
      required: true,
    },
    // Location Hierarchy
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      required: true,
    },
    district: { // Optional for now if Cluster is enough, but good for filtering
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
    },
    cluster: { // The granular location selected in UI
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cluster',
    },
    cp: { // Company Partner?
      type: String,
      trim: true
    },
    // Contact Details
    mobile: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    address: { // Full address from lead or user input
      type: String,
      trim: true
    },

    // Consumer Details
    consumerNumber: {
      type: String,
      trim: true
    },
    authorizedPersonName: {
      type: String,
      trim: true
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    installationDate: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
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
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster filtering
projectSchema.index({ status: 1 });
projectSchema.index({ state: 1 });
projectSchema.index({ cluster: 1 });
projectSchema.index({ category: 1 });

export default mongoose.model('Project', projectSchema);
