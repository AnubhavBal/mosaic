import mongoose from 'mongoose';

const progressPhotoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    journeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Journey',
      required: true,
      index: true,
    },
    checkinId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Checkin',
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    storagePublicId: {
      type: String,
      default: '',
    },
    caption: {
      type: String,
      trim: true,
      default: '',
    },
    dayNumber: {
      type: Number,
      default: 1,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

progressPhotoSchema.index({ userId: 1, journeyId: 1, uploadedAt: -1 });

export default mongoose.model('ProgressPhoto', progressPhotoSchema);
