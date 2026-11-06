import Notification from '../models/Notification.js';
import Journey from '../models/Journey.js';
import Checkin from '../models/Checkin.js';
import WeeklyReflection from '../models/WeeklyReflection.js';

// @desc    Get customer notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   POST /api/notifications/mark-all-read
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate pending reminders based on active journeys
// @route   POST /api/notifications/check-reminders
// @access  Private
export const checkAndGenerateReminders = async (req, res) => {
  try {
    const activeJourneys = await Journey.find({
      userId: req.user._id,
      status: 'active',
    }).populate('productId');

    const todayStr = new Date().toISOString().split('T')[0];
    let createdCount = 0;

    for (const journey of activeJourneys) {
      // 1. Check daily check-in
      const checkedInToday = await Checkin.exists({
        userId: req.user._id,
        journeyId: journey._id,
        date: todayStr,
      });

      if (!checkedInToday) {
        // Only generate one reminder per day per journey
        const alreadyNotifiedToday = await Notification.exists({
          userId: req.user._id,
          type: 'daily_checkin',
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
          'metadata.journeyId': journey._id,
        });

        if (!alreadyNotifiedToday) {
          await Notification.create({
            userId: req.user._id,
            type: 'daily_checkin',
            title: `Time for your daily check-in 🌿`,
            message: `How is your experience with ${journey.productId.name} today? Take 30 seconds to log your mood and consistency.`,
            metadata: { journeyId: journey._id },
          });
          createdCount++;
        }
      }

      // 2. Check weekly reflection
      const startDate = new Date(journey.startDate);
      const daysUsing = Math.max(1, Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24)) + 1);
      const currentWeek = Math.floor((daysUsing - 1) / 7) + 1;

      if (currentWeek > 1) {
        const reflectedThisWeek = await WeeklyReflection.exists({
          userId: req.user._id,
          journeyId: journey._id,
          weekNumber: currentWeek,
        });

        if (!reflectedThisWeek) {
          const alreadyNotifiedWeek = await Notification.exists({
            userId: req.user._id,
            type: 'weekly_reflection',
            'metadata.journeyId': journey._id,
            'metadata.weekNumber': currentWeek,
          });

          if (!alreadyNotifiedWeek) {
            await Notification.create({
              userId: req.user._id,
              type: 'weekly_reflection',
              title: `Week ${currentWeek} Reflection Ready 📝`,
              message: `You've completed another week with ${journey.productId.name}. Share your weekly reflection to review your overall progress.`,
              metadata: { journeyId: journey._id, weekNumber: currentWeek },
            });
            createdCount++;
          }
        }
      }
    }

    res.json({
      success: true,
      createdCount,
      message: `Checked reminders for ${activeJourneys.length} active journeys`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
