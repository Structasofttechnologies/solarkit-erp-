import mongoose from 'mongoose';

const installationSchema = new mongoose.Schema(
  {
    installationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    installer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    delivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery',
      default: null,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    actualInstallationDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'in_progress', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    feedback: {
      type: String,
      default: null,
    },
    proofOfInstallation: {
      signature: String,
      photos: [String],
      timestamp: Date,
    },
    installationCost: {
      type: Number,
      default: 0,
    },
    labourCost: {
      type: Number,
      default: 0,
    },
    additionalCharges: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: null,
    },
    category: String,
    subCategory: String,
    projectType: String,
    timeline: String,
  },
  { timestamps: true }
);

export default mongoose.model('Installation', installationSchema);
