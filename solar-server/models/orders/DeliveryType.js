import mongoose from 'mongoose';

const deliveryTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      // Removed unique: true to allow the same type (like Standard Delivery) per district
    },
    description: {
      type: String,
      trim: true,
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
    },
    cluster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cluster',
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse'
    },
    coverageType: [{
      type: String,
      enum: ['Cluster', 'District', 'State'],
    }],
    coverageRange: {
      type: Number,
      default: 0
    },
    applicableCategories: [{
      category: String,
      subCategory: String,
      projectType: String,
      subProjectType: String,
      cluster: String,
      cost: Number,
      isActive: { type: Boolean, default: true }
    }],
    deliveryTiming: {
      minDays: Number,
      maxDays: Number,
      estimatedDelivery: String,
      deliveryCharges: Number,
      procurementResults: [String]
    },
    restrictions: {
      districts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
      }]
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// We will drop the old unique index on `name` in the controller

export default mongoose.model('DeliveryType', deliveryTypeSchema);
