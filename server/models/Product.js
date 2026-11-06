import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: ['Skincare', 'Haircare', 'Wellness', 'Nutrition', 'Bodycare'],
      default: 'Wellness',
    },
    image: {
      type: String,
      required: [true, 'Product image URL is required'],
    },
    usageInstructions: {
      type: String,
      default: 'Apply or consume daily as directed on the label.',
    },
    expectedResults: {
      type: String,
      default: 'Visible consistency benefits within 4-12 weeks of continuous use.',
    },
    recommendedDurationDays: {
      type: Number,
      default: 90,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Product', productSchema);
