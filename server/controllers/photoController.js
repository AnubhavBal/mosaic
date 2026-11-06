import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ProgressPhoto from '../models/ProgressPhoto.js';
import Journey from '../models/Journey.js';
import Checkin from '../models/Checkin.js';
import { processUploadedFile, deleteStoredFile } from '../services/uploadService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

// @desc    Upload a standalone progress photograph
// @route   POST /api/photos
// @access  Private
export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload' });
    }

    const { journeyId, caption, dayNumber, date } = req.body;

    if (!journeyId) {
      return res.status(400).json({ success: false, message: 'Journey ID is required' });
    }

    const journey = await Journey.findOne({ _id: journeyId, userId: req.user._id });
    if (!journey) {
      return res.status(404).json({ success: false, message: 'Journey not found' });
    }

    const photoData = await processUploadedFile(req.file, req.user._id);

    // Calculate day number if not provided
    let calculatedDay = dayNumber ? parseInt(dayNumber, 10) : 1;
    if (!dayNumber && journey.startDate) {
      const start = new Date(journey.startDate);
      start.setHours(0, 0, 0, 0);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      calculatedDay = Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1);
    }

    const photo = await ProgressPhoto.create({
      userId: req.user._id,
      journeyId,
      imageUrl: photoData.url,
      storagePublicId: photoData.publicId,
      caption: caption || `Day ${calculatedDay} Photo`,
      dayNumber: calculatedDay,
      date: date || new Date().toISOString().split('T')[0],
    });

    res.status(201).json({
      success: true,
      photo,
      message: 'Progress photo saved successfully!',
    });
  } catch (error) {
    console.error('uploadPhoto error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer's progress photos (optionally filtered by journey)
// @route   GET /api/photos
// @access  Private
export const getPhotos = async (req, res) => {
  try {
    const { journeyId } = req.query;
    const query = { userId: req.user._id };

    if (journeyId) {
      query.journeyId = journeyId;
    }

    const photos = await ProgressPhoto.find(query)
      .sort({ date: -1, uploadedAt: -1 })
      .populate({
        path: 'journeyId',
        select: 'startDate productId status',
        populate: { path: 'productId', select: 'name category' },
      });

    res.json({
      success: true,
      count: photos.length,
      photos,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a progress photo
// @route   DELETE /api/photos/:id
// @access  Private
export const deletePhoto = async (req, res) => {
  try {
    const photo = await ProgressPhoto.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    // Clean up physical file or Cloudinary asset
    if (photo.storagePublicId) {
      await deleteStoredFile(photo.storagePublicId);
    }

    // If attached to a checkin, clear the checkin's photo fields
    if (photo.checkinId) {
      await Checkin.findByIdAndUpdate(photo.checkinId, {
        photoUrl: '',
        photoPublicId: '',
      });
    }

    await ProgressPhoto.findByIdAndDelete(photo._id);

    res.json({
      success: true,
      message: 'Progress photo deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Serve private/local photos securely with authentication
// @route   GET /api/photos/file/:filename
// @access  Private or protected
export const serveSecurePhoto = async (req, res) => {
  try {
    const { filename } = req.params;

    // Prevent directory traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadsDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Image file not found' });
    }

    // Check that this photo belongs to the authenticated user
    const photo = await ProgressPhoto.findOne({
      $or: [
        { storagePublicId: safeFilename },
        { imageUrl: { $regex: safeFilename } },
      ],
      userId: req.user._id,
    });

    const checkin = await Checkin.findOne({
      $or: [
        { photoPublicId: safeFilename },
        { photoUrl: { $regex: safeFilename } },
      ],
      userId: req.user._id,
    });

    if (!photo && !checkin && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this photograph.',
      });
    }

    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
