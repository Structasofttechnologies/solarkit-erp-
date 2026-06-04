import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema(
  {
    deliveryNumber: {
      type: String,
      required: true,
      unique: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    installer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deliveryType: {
      type: String,
      enum: ['prime', 'regular', 'express'],
      default: 'regular',
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    actualDeliveryDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'in_transit', 'delivered', 'failed', 'cancelled'],
      default: 'pending',
    },
    deliveryCost: {
      type: Number,
      default: 0,
    },
    distance: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: null,
    },
    proofOfDelivery: {
      signature: String,
      photo: String,
      timestamp: Date,
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
      ref: 'Warehouse',
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
    },
    category: String,
    subCategory: String,
    projectType: String,
    timeline: String,
  },
  { timestamps: true }
);

export default mongoose.model('Delivery', deliverySchema);
