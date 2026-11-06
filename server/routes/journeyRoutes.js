import express from 'express';
import {
  getJourneys,
  getJourneyById,
  createJourney,
  updateJourney,
  deleteJourney,
} from '../controllers/journeyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All journey routes are scoped to authenticated user

router.route('/')
  .get(getJourneys)
  .post(createJourney);

router.route('/:id')
  .get(getJourneyById)
  .patch(updateJourney)
  .delete(deleteJourney);

export default router;
