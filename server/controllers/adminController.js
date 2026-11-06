import User from '../models/User.js';
import Journey from '../models/Journey.js';
import Checkin from '../models/Checkin.js';
import WeeklyReflection from '../models/WeeklyReflection.js';
import Product from '../models/Product.js';

// @desc    Get aggregated anonymised wellness metrics for admin
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    // 1. Overall counts
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const totalJourneys = await Journey.countDocuments();
    const activeJourneys = await Journey.countDocuments({ status: 'active' });
    const completedJourneys = await Journey.countDocuments({ status: 'completed' });
    const totalCheckins = await Checkin.countDocuments();
    const totalReflections = await WeeklyReflection.countDocuments();

    // 2. Aggregate mood trends (anonymized)
    const moodAggregation = await Checkin.aggregate([
      {
        $group: {
          _id: '$mood',
          count: { $sum: 1 },
        },
      },
    ]);

    const moodDistribution = {
      very_bad: 0,
      bad: 0,
      okay: 0,
      good: 0,
      excellent: 0,
    };
    moodAggregation.forEach((item) => {
      if (item._id && moodDistribution[item._id] !== undefined) {
        moodDistribution[item._id] = item.count;
      }
    });

    // 3. Commonly reported discomfort (anonymized counts)
    const discomfortAggregation = await Checkin.aggregate([
      {
        $group: {
          _id: '$discomfort',
          count: { $sum: 1 },
        },
      },
    ]);

    const discomfortBreakdown = {
      none: 0,
      mild: 0,
      moderate: 0,
      significant: 0,
      described_in_notes: 0,
    };
    discomfortAggregation.forEach((item) => {
      if (item._id && discomfortBreakdown[item._id] !== undefined) {
        discomfortBreakdown[item._id] = item.count;
      }
    });

    // 4. Usage consistency breakdown
    const consistencyAggregation = await Checkin.aggregate([
      {
        $group: {
          _id: '$usageConsistency',
          count: { $sum: 1 },
        },
      },
    ]);

    // 5. Weekly reflection ratings average & sentiment
    const reflectionStats = await WeeklyReflection.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          total: { $sum: 1 },
        },
      },
    ]);

    // 6. Journeys per product
    const journeysByProduct = await Journey.aggregate([
      {
        $group: {
          _id: '$productId',
          totalJourneys: { $sum: 1 },
          activeJourneys: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$_id',
          productName: '$product.name',
          category: '$product.category',
          totalJourneys: 1,
          activeJourneys: 1,
        },
      },
    ]);

    // 7. Retention & completion metrics
    const retentionRate = totalJourneys > 0
      ? Math.round((activeJourneys / totalJourneys) * 100)
      : 100;

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalJourneys,
        activeJourneys,
        completedJourneys,
        retentionRate,
        totalCheckins,
        totalReflections,
        avgReflectionRating: reflectionStats.length > 0 ? Number(reflectionStats[0].avgRating.toFixed(1)) : 0,
        moodDistribution,
        discomfortBreakdown,
        consistencyAggregation,
        journeysByProduct,
      },
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
