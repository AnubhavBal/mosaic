import express from 'express';
import {
  getProfile,
  updateProfile,
  exportCustomerData,
  deleteAccount,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.get('/export', exportCustomerData);
router.delete('/account', deleteAccount);

export default router;
