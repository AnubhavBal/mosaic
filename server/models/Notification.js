import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['daily_checkin', 'weekly_reflection', 'milestone', 'system'],
      default: 'daily_checkin',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      journeyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Journey' },
      dayNumber: Number,
      weekNumber: Number,
      link: String,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
