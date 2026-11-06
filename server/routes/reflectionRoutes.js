import express from 'express';
import {
  submitReflection,
  getReflections,
  getReflectionById,
  updateReflection,
} from '../controllers/reflectionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getReflections)
  .post(submitReflection);

router.route('/:id')
  .get(getReflectionById)
  .patch(updateReflection);

export default router;
