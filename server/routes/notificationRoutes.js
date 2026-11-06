import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  checkAndGenerateReminders,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.post('/mark-all-read', markAllAsRead);
router.post('/check-reminders', checkAndGenerateReminders);

export default router;
