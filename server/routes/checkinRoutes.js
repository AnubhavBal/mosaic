import express from 'express';
import {
  submitCheckin,
  getCheckins,
  getCheckinById,
  deleteCheckin,
} from '../controllers/checkinController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../services/uploadService.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCheckins)
  .post(upload.single('photo'), submitCheckin);

router.route('/:id')
  .get(getCheckinById)
  .delete(deleteCheckin);

export default router;
