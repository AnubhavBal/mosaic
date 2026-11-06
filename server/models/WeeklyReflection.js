import mongoose from 'mongoose';

const weeklyReflectionSchema = new mongoose.Schema(
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
    weekNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    experience: {
      type: String,
      required: [true, 'Please select how your experience changed this week'],
      enum: ['much_better', 'a_little_better', 'no_change', 'worse', 'not_sure'],
    },
    positiveChanges: {
      type: String,
      trim: true,
      default: '',
    },
    challenges: {
      type: String,
      trim: true,
      default: '',
    },
    unwantedEffects: {
      type: String,
      trim: true,
      default: '',
    },
    continuationLikelihood: {
      type: String,
      required: [true, 'Please indicate your continuation likelihood'],
      enum: ['very_likely', 'likely', 'not_sure', 'unlikely'],
    },
    rating: {
      type: Number,
      required: [true, 'Please rate your overall experience from 1 to 10'],
      min: 1,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate weekly reflections for the same user, journey and week number
weeklyReflectionSchema.index({ userId: 1, journeyId: 1, weekNumber: 1 }, { unique: true });

export default mongoose.model('WeeklyReflection', weeklyReflectionSchema);
