import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    categoryIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    }],
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: false,
    },
    subCategoryIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
    }],
    subProjectTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubProjectType',
      required: false,
    },
    subProjectTypeIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubProjectType',
    }],
    projectTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectType',
      required: false,
    },
    projectTypeFrom: {
      type: Number,
      required: false,
    },
    projectTypeTo: {
      type: Number,
      required: false,
    },
    projectTypes: [{
        from: { type: Number },
        to: { type: Number }
    }],
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BrandManufacturer',
      required: false,
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: false,
    },
    skuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SKU',
      required: false,
      unique: true,
      sparse: true
    },
    // Location Hierarchy
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      required: false
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: false
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: false
    },
    clusterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cluster',
      required: false
    },
    serialNo: {
      type: String,
      default: ''
    },
    subtype: {
      type: String,
      default: 'On-Grid'
    },
    technology: {
      type: String,
      default: 'Mono-Perc'
    },
    tolerance: {
      type: String,
      default: '+/- 3%'
    },
    dcr: {
      type: String,
      default: 'DCR'
    },
    datasheet: {
      type: String,
      default: ''
    },
    mechanicalParameters: {
      type: [String],
      default: []
    },
    electricalParameters: {
      type: [String],
      default: []
    },
    skuParameters: {
      type: [String],
      default: []
    },
    additionalSkus: {
      type: [String],
      default: []
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
