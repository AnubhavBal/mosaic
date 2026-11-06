import mongoose from 'mongoose';

const journeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Journey start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    targetDurationDays: {
      type: Number,
      default: 90,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed'],
      default: 'active',
      index: true,
    },
    personalGoal: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

journeySchema.index({ userId: 1, status: 1 });

export default mongoose.model('Journey', journeySchema);
