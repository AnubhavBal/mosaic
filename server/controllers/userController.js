import User from '../models/User.js';
import Journey from '../models/Journey.js';
import Checkin from '../models/Checkin.js';
import WeeklyReflection from '../models/WeeklyReflection.js';
import ProgressPhoto from '../models/ProgressPhoto.js';
import Notification from '../models/Notification.js';
import { deleteStoredFile } from '../services/uploadService.js';

// @desc    Get customer profile with full summary
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const journeys = await Journey.find({ userId: req.user._id }).populate('productId');
    const totalCheckins = await Checkin.countDocuments({ userId: req.user._id });
    const totalReflections = await WeeklyReflection.countDocuments({ userId: req.user._id });
    const totalPhotos = await ProgressPhoto.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        privacyConsent: user.privacyConsent,
        notificationPreferences: user.notificationPreferences,
        createdAt: user.createdAt,
        stats: {
          totalJourneys: journeys.length,
          activeJourneys: journeys.filter((j) => j.status === 'active').length,
          totalCheckins,
          totalReflections,
          totalPhotos,
        },
        journeys,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update customer profile and notification preferences
// @route   PATCH /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, notificationPreferences, privacyConsent } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (privacyConsent !== undefined) user.privacyConsent = privacyConsent;

    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences,
      };
    }

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        notificationPreferences: user.notificationPreferences,
        privacyConsent: user.privacyConsent,
        createdAt: user.createdAt,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export all customer journey data (JSON download)
// @route   GET /api/users/export
// @access  Private
export const exportCustomerData = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    const journeys = await Journey.find({ userId }).populate('productId');
    const checkins = await Checkin.find({ userId }).sort({ date: -1 });
    const reflections = await WeeklyReflection.find({ userId }).sort({ weekNumber: -1 });
    const photos = await ProgressPhoto.find({ userId }).select('date dayNumber caption imageUrl uploadedAt');

    const exportPackage = {
      exportedAt: new Date().toISOString(),
      customer: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        registeredAt: user.createdAt,
      },
      summary: {
        totalJourneys: journeys.length,
        totalCheckins: checkins.length,
        totalReflections: reflections.length,
        totalPhotos: photos.length,
      },
      journeys: journeys.map((j) => ({
        id: j._id,
        product: j.productId ? j.productId.name : 'Unknown Product',
        category: j.productId ? j.productId.category : '',
        startDate: j.startDate,
        status: j.status,
      })),
      checkins: checkins.map((c) => ({
        journeyId: c.journeyId,
        date: c.date,
        mood: c.mood,
        usageConsistency: c.usageConsistency,
        changesNoticed: c.changesNoticed,
        discomfort: c.discomfort,
        additionalNotes: c.additionalNotes,
        hasPhoto: Boolean(c.photoUrl),
      })),
      reflections: reflections.map((r) => ({
        journeyId: r.journeyId,
        weekNumber: r.weekNumber,
        experience: r.experience,
        positiveChanges: r.positiveChanges,
        challenges: r.challenges,
        unwantedEffects: r.unwantedEffects,
        continuationLikelihood: r.continuationLikelihood,
        rating: r.rating,
        recordedAt: r.createdAt,
      })),
      photos: photos.map((p) => ({
        date: p.date,
        dayNumber: p.dayNumber,
        caption: p.caption,
        imageUrl: p.imageUrl,
      })),
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=mosaic_wellness_export_${user._id}.json`);
    res.json(exportPackage);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete customer account and purge all data
// @route   DELETE /api/users/account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Delete all user uploaded photos
    const photos = await ProgressPhoto.find({ userId });
    for (const photo of photos) {
      if (photo.storagePublicId) {
        await deleteStoredFile(photo.storagePublicId);
      }
    }
    await ProgressPhoto.deleteMany({ userId });

    // 2. Delete checkins, reflections, journeys, notifications
    await Checkin.deleteMany({ userId });
    await WeeklyReflection.deleteMany({ userId });
    await Journey.deleteMany({ userId });
    await Notification.deleteMany({ userId });

    // 3. Delete user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Your account and all associated personal journey data have been permanently removed.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
