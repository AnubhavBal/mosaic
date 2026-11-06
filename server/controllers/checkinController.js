import Checkin from '../models/Checkin.js';
import Journey from '../models/Journey.js';
import ProgressPhoto from '../models/ProgressPhoto.js';
import Notification from '../models/Notification.js';
import { processUploadedFile, deleteStoredFile } from '../services/uploadService.js';

// @desc    Submit a daily check-in (or update today's check-in)
// @route   POST /api/checkins
// @access  Private
export const submitCheckin = async (req, res) => {
  try {
    const {
      journeyId,
      mood,
      usageConsistency,
      changesNoticed,
      discomfort,
      additionalNotes,
      date,
    } = req.body;

    if (!journeyId) {
      return res.status(400).json({ success: false, message: 'Journey ID is required' });
    }

    if (!mood || !usageConsistency) {
      return res.status(400).json({
        success: false,
        message: 'Please answer both the mood and usage consistency questions',
      });
    }

    // Verify journey belongs to user
    const journey = await Journey.findOne({ _id: journeyId, userId: req.user._id }).populate('productId');
    if (!journey) {
      return res.status(404).json({ success: false, message: 'Active journey not found' });
    }

    // Normalize date (default to today YYYY-MM-DD in local/server time)
    const checkinDate = date || new Date().toISOString().split('T')[0];

    // Parse changesNoticed if sent as JSON string from multipart form
    let parsedChanges = changesNoticed;
    if (typeof changesNoticed === 'string') {
      try {
        parsedChanges = JSON.parse(changesNoticed);
      } catch (e) {
        parsedChanges = changesNoticed ? [changesNoticed] : [];
      }
    }

    // Process optional uploaded photo
    let photoData = null;
    if (req.file) {
      photoData = await processUploadedFile(req.file, req.user._id);
    }

    // Calculate day number since journey start
    const startDate = new Date(journey.startDate);
    startDate.setHours(0, 0, 0, 0);
    const currentDate = new Date(checkinDate);
    currentDate.setHours(0, 0, 0, 0);
    const dayNumber = Math.max(1, Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24)) + 1);

    // Check if check-in already exists for this date (prevent accidental duplicates, allow update)
    let checkin = await Checkin.findOne({
      userId: req.user._id,
      journeyId,
      date: checkinDate,
    });

    let isUpdate = false;

    if (checkin) {
      isUpdate = true;
      checkin.mood = mood;
      checkin.usageConsistency = usageConsistency;
      checkin.changesNoticed = Array.isArray(parsedChanges) ? parsedChanges : [];
      checkin.discomfort = discomfort || 'none';
      checkin.additionalNotes = additionalNotes || '';

      if (photoData) {
        // If replacing photo, clean up old photo
        if (checkin.photoPublicId) {
          await deleteStoredFile(checkin.photoPublicId);
        }
        checkin.photoUrl = photoData.url;
        checkin.photoPublicId = photoData.publicId;

        // Also create/update ProgressPhoto record
        await ProgressPhoto.create({
          userId: req.user._id,
          journeyId,
          checkinId: checkin._id,
          imageUrl: photoData.url,
          storagePublicId: photoData.publicId,
          caption: additionalNotes || `Day ${dayNumber} Check-in Photo`,
          dayNumber,
          date: checkinDate,
        });
      }

      await checkin.save();
    } else {
      // Create new check-in
      checkin = await Checkin.create({
        userId: req.user._id,
        journeyId,
        date: checkinDate,
        mood,
        usageConsistency,
        changesNoticed: Array.isArray(parsedChanges) ? parsedChanges : [],
        discomfort: discomfort || 'none',
        additionalNotes: additionalNotes || '',
        photoUrl: photoData ? photoData.url : '',
        photoPublicId: photoData ? photoData.publicId : '',
      });

      if (photoData) {
        await ProgressPhoto.create({
          userId: req.user._id,
          journeyId,
          checkinId: checkin._id,
          imageUrl: photoData.url,
          storagePublicId: photoData.publicId,
          caption: additionalNotes || `Day ${dayNumber} Check-in Photo`,
          dayNumber,
          date: checkinDate,
        });
      }

      // Check for milestones
      const milestones = [1, 7, 14, 30, 60, 90];
      if (milestones.includes(dayNumber)) {
        await Notification.create({
          userId: req.user._id,
          type: 'milestone',
          title: `Milestone reached: Day ${dayNumber}! 🏆`,
          message: `Congratulations on reaching Day ${dayNumber} with ${journey.productId.name}. Consistency is key to lasting results!`,
          metadata: { journeyId, dayNumber },
        });
      }
    }

    res.status(isUpdate ? 200 : 201).json({
      success: true,
      checkin,
      isUpdate,
      dayNumber,
      message: isUpdate
        ? `Day ${dayNumber} check-in updated successfully!`
        : `Day ${dayNumber} check-in submitted successfully! Keep up the momentum.`,
    });
  } catch (error) {
    console.error('submitCheckin error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get check-in history with filters and pagination
// @route   GET /api/checkins
// @access  Private
export const getCheckins = async (req, res) => {
  try {
    const { journeyId, days, limit = 50, page = 1 } = req.query;

    const query = { userId: req.user._id };

    if (journeyId) {
      query.journeyId = journeyId;
    }

    if (days && days !== 'all') {
      const numDays = parseInt(days, 10);
      if (!isNaN(numDays)) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - numDays);
        const cutoffStr = cutoffDate.toISOString().split('T')[0];
        query.date = { $gte: cutoffStr };
      }
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const checkins = await Checkin.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate({
        path: 'journeyId',
        select: 'startDate productId status',
        populate: { path: 'productId', select: 'name category image' },
      });

    const total = await Checkin.countDocuments(query);

    res.json({
      success: true,
      count: checkins.length,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      checkins,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single check-in by ID
// @route   GET /api/checkins/:id
// @access  Private
export const getCheckinById = async (req, res) => {
  try {
    const checkin = await Checkin.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate({
      path: 'journeyId',
      populate: { path: 'productId', select: 'name category image' },
    });

    if (!checkin) {
      return res.status(404).json({ success: false, message: 'Check-in not found' });
    }

    res.json({
      success: true,
      checkin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a check-in
// @route   DELETE /api/checkins/:id
// @access  Private
export const deleteCheckin = async (req, res) => {
  try {
    const checkin = await Checkin.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!checkin) {
      return res.status(404).json({ success: false, message: 'Check-in not found' });
    }

    // Clean up photo if attached
    if (checkin.photoPublicId) {
      await deleteStoredFile(checkin.photoPublicId);
      await ProgressPhoto.deleteMany({ checkinId: checkin._id });
    }

    await Checkin.findByIdAndDelete(checkin._id);

    res.json({
      success: true,
      message: 'Check-in record deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
