import Journey from '../models/Journey.js';
import Product from '../models/Product.js';
import Checkin from '../models/Checkin.js';
import WeeklyReflection from '../models/WeeklyReflection.js';
import Notification from '../models/Notification.js';

// Helper to calculate days between two dates
const calculateDaysDifference = (startDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffTime = Math.max(0, now - start);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // Day 1 on start date
  return diffDays;
};

// Helper to compute consecutive check-in streak
const calculateStreak = async (userId, journeyId) => {
  const checkins = await Checkin.find({ userId, journeyId }).sort({ date: -1 });
  if (checkins.length === 0) return { currentStreak: 0, totalCheckins: 0 };

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const checkinDates = new Set(checkins.map((c) => c.date));

  // Streak continues if checked in today or yesterday
  let currentStreak = 0;
  let testDate = new Date();

  // If user hasn't checked in today yet, test starting from yesterday
  if (!checkinDates.has(todayStr)) {
    testDate = new Date(Date.now() - 86400000);
  }

  while (true) {
    const dStr = testDate.toISOString().split('T')[0];
    if (checkinDates.has(dStr)) {
      currentStreak++;
      testDate = new Date(testDate.getTime() - 86400000);
    } else {
      break;
    }
  }

  return {
    currentStreak,
    totalCheckins: checkins.length,
  };
};

// @desc    Get all journeys for authenticated customer
// @route   GET /api/journeys
// @access  Private
export const getJourneys = async (req, res) => {
  try {
    const journeys = await Journey.find({ userId: req.user._id })
      .populate('productId')
      .sort({ updatedAt: -1 });

    const journeysWithStats = await Promise.all(
      journeys.map(async (journey) => {
        const daysUsing = calculateDaysDifference(journey.startDate);
        const { currentStreak, totalCheckins } = await calculateStreak(req.user._id, journey._id);
        const reflectionsCount = await WeeklyReflection.countDocuments({
          userId: req.user._id,
          journeyId: journey._id,
        });

        // Check if checked in today
        const todayStr = new Date().toISOString().split('T')[0];
        const checkedInToday = await Checkin.exists({
          userId: req.user._id,
          journeyId: journey._id,
          date: todayStr,
        });

        return {
          ...journey.toObject(),
          daysUsing,
          currentStreak,
          totalCheckins,
          reflectionsCount,
          checkedInToday: Boolean(checkedInToday),
        };
      })
    );

    res.json({
      success: true,
      journeys: journeysWithStats,
    });
  } catch (error) {
    console.error('getJourneys error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single journey details with full stats
// @route   GET /api/journeys/:id
// @access  Private
export const getJourneyById = async (req, res) => {
  try {
    const journey = await Journey.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('productId');

    if (!journey) {
      return res.status(404).json({ success: false, message: 'Journey not found' });
    }

    const daysUsing = calculateDaysDifference(journey.startDate);
    const { currentStreak, totalCheckins } = await calculateStreak(req.user._id, journey._id);
    const reflectionsCount = await WeeklyReflection.countDocuments({
      userId: req.user._id,
      journeyId: journey._id,
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const todayCheckin = await Checkin.findOne({
      userId: req.user._id,
      journeyId: journey._id,
      date: todayStr,
    });

    // Milestone completion flags
    const milestones = [1, 7, 14, 30, 60, 90].map((day) => ({
      day,
      label: `Day ${day}`,
      achieved: daysUsing >= day,
      current: daysUsing >= day && (day === 90 || daysUsing < [1, 7, 14, 30, 60, 90][[1, 7, 14, 30, 60, 90].indexOf(day) + 1]),
    }));

    res.json({
      success: true,
      journey: {
        ...journey.toObject(),
        daysUsing,
        currentStreak,
        totalCheckins,
        reflectionsCount,
        checkedInToday: Boolean(todayCheckin),
        todayCheckin,
        milestones,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Start a new product journey
// @route   POST /api/journeys
// @access  Private
export const createJourney = async (req, res) => {
  try {
    const { productId, startDate, targetDurationDays, personalGoal } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Please select a product for your journey' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if customer already has an active journey for this product
    const existingActive = await Journey.findOne({
      userId: req.user._id,
      productId,
      status: 'active',
    });

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active journey for this product.',
      });
    }

    const start = startDate ? new Date(startDate) : new Date();

    const journey = await Journey.create({
      userId: req.user._id,
      productId,
      startDate: start,
      targetDurationDays: targetDurationDays || product.recommendedDurationDays || 90,
      personalGoal: personalGoal || '',
      status: 'active',
    });

    // Create a welcome notification
    await Notification.create({
      userId: req.user._id,
      type: 'milestone',
      title: `Welcome to Day 1!`,
      message: `You've begun your journey with ${product.name}. Check in daily to track real progress.`,
      metadata: { journeyId: journey._id, dayNumber: 1 },
    });

    const populated = await Journey.findById(journey._id).populate('productId');

    res.status(201).json({
      success: true,
      journey: {
        ...populated.toObject(),
        daysUsing: 1,
        currentStreak: 0,
        totalCheckins: 0,
        reflectionsCount: 0,
        checkedInToday: false,
      },
      message: 'Product journey started successfully!',
    });
  } catch (error) {
    console.error('createJourney error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update journey status (pause, resume, end)
// @route   PATCH /api/journeys/:id
// @access  Private
export const updateJourney = async (req, res) => {
  try {
    const { status, personalGoal } = req.body;

    const journey = await Journey.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!journey) {
      return res.status(404).json({ success: false, message: 'Journey not found' });
    }

    if (status) {
      journey.status = status;
      if (status === 'completed') {
        journey.endDate = new Date();
      }
    }

    if (personalGoal !== undefined) {
      journey.personalGoal = personalGoal;
    }

    await journey.save();
    const updated = await Journey.findById(journey._id).populate('productId');

    res.json({
      success: true,
      journey: updated,
      message: `Journey status updated to ${journey.status}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a journey and related check-ins
// @route   DELETE /api/journeys/:id
// @access  Private
export const deleteJourney = async (req, res) => {
  try {
    const journey = await Journey.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!journey) {
      return res.status(404).json({ success: false, message: 'Journey not found' });
    }

    // Delete associated checkins and reflections
    await Checkin.deleteMany({ userId: req.user._id, journeyId: journey._id });
    await WeeklyReflection.deleteMany({ userId: req.user._id, journeyId: journey._id });
    await Journey.findByIdAndDelete(journey._id);

    res.json({
      success: true,
      message: 'Product journey deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
