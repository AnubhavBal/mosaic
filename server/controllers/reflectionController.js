import WeeklyReflection from '../models/WeeklyReflection.js';
import Journey from '../models/Journey.js';
import Notification from '../models/Notification.js';

// @desc    Submit a weekly reflection
// @route   POST /api/reflections
// @access  Private
export const submitReflection = async (req, res) => {
  try {
    const {
      journeyId,
      weekNumber,
      weekStartDate,
      experience,
      positiveChanges,
      challenges,
      unwantedEffects,
      continuationLikelihood,
      rating,
    } = req.body;

    if (!journeyId || !weekNumber || !experience || !continuationLikelihood || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required reflection questions (experience, likelihood, and rating)',
      });
    }

    const journey = await Journey.findOne({ _id: journeyId, userId: req.user._id }).populate('productId');
    if (!journey) {
      return res.status(404).json({ success: false, message: 'Journey not found' });
    }

    // Check if reflection for this week already exists (prevent duplicates, or update)
    let reflection = await WeeklyReflection.findOne({
      userId: req.user._id,
      journeyId,
      weekNumber: parseInt(weekNumber, 10),
    });

    let isUpdate = false;
    const computedStartDate = weekStartDate ? new Date(weekStartDate) : new Date();

    if (reflection) {
      isUpdate = true;
      reflection.experience = experience;
      reflection.positiveChanges = positiveChanges || '';
      reflection.challenges = challenges || '';
      reflection.unwantedEffects = unwantedEffects || '';
      reflection.continuationLikelihood = continuationLikelihood;
      reflection.rating = parseInt(rating, 10);
      await reflection.save();
    } else {
      reflection = await WeeklyReflection.create({
        userId: req.user._id,
        journeyId,
        weekNumber: parseInt(weekNumber, 10),
        weekStartDate: computedStartDate,
        experience,
        positiveChanges: positiveChanges || '',
        challenges: challenges || '',
        unwantedEffects: unwantedEffects || '',
        continuationLikelihood,
        rating: parseInt(rating, 10),
      });

      // Notify customer
      await Notification.create({
        userId: req.user._id,
        type: 'weekly_reflection',
        title: `Week ${weekNumber} Reflection Recorded! 🌱`,
        message: `Great job completing your Week ${weekNumber} reflection for ${journey.productId.name}. Tracking self-awareness leads to better outcomes.`,
        metadata: { journeyId, weekNumber },
      });
    }

    res.status(isUpdate ? 200 : 201).json({
      success: true,
      reflection,
      isUpdate,
      message: isUpdate
        ? `Week ${weekNumber} reflection updated successfully!`
        : `Week ${weekNumber} reflection saved successfully!`,
    });
  } catch (error) {
    console.error('submitReflection error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all weekly reflections for authenticated customer
// @route   GET /api/reflections
// @access  Private
export const getReflections = async (req, res) => {
  try {
    const { journeyId } = req.query;
    const query = { userId: req.user._id };

    if (journeyId) {
      query.journeyId = journeyId;
    }

    const reflections = await WeeklyReflection.find(query)
      .sort({ weekNumber: -1 })
      .populate({
        path: 'journeyId',
        select: 'startDate productId status',
        populate: { path: 'productId', select: 'name category image' },
      });

    res.json({
      success: true,
      count: reflections.length,
      reflections,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single reflection by ID
// @route   GET /api/reflections/:id
// @access  Private
export const getReflectionById = async (req, res) => {
  try {
    const reflection = await WeeklyReflection.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate({
      path: 'journeyId',
      populate: { path: 'productId', select: 'name category image' },
    });

    if (!reflection) {
      return res.status(404).json({ success: false, message: 'Reflection not found' });
    }

    res.json({
      success: true,
      reflection,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a reflection
// @route   PATCH /api/reflections/:id
// @access  Private
export const updateReflection = async (req, res) => {
  try {
    const reflection = await WeeklyReflection.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!reflection) {
      return res.status(404).json({ success: false, message: 'Reflection not found' });
    }

    res.json({
      success: true,
      reflection,
      message: 'Reflection updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
