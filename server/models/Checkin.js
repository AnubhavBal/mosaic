import mongoose from 'mongoose';

const checkinSchema = new mongoose.Schema(
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
    date: {
      type: String, // Stored as YYYY-MM-DD for precise day deduplication
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
    },
    mood: {
      type: String,
      required: [true, 'Please select your mood for today'],
      enum: ['very_bad', 'bad', 'okay', 'good', 'excellent'],
    },
    usageConsistency: {
      type: String,
      required: [true, 'Please indicate product usage consistency'],
      enum: ['used_as_directed', 'used_most_days', 'used_occasionally', 'did_not_use'],
    },
    changesNoticed: {
      type: [String],
      default: [],
    },
    discomfort: {
      type: String,
      required: [true, 'Please indicate if any discomfort was observed'],
      enum: ['none', 'mild', 'moderate', 'significant', 'described_in_notes'],
      default: 'none',
    },
    additionalNotes: {
      type: String,
      trim: true,
      default: '',
    },
    photoUrl: {
      type: String,
      default: '',
    },
    photoPublicId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate daily submissions for the same user, journey and date
checkinSchema.index({ userId: 1, journeyId: 1, date: 1 }, { unique: true });

export default mongoose.model('Checkin', checkinSchema);
