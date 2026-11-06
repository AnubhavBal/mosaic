import express from 'express';
import {
  uploadPhoto,
  getPhotos,
  deletePhoto,
  serveSecurePhoto,
} from '../controllers/photoController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../services/uploadService.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPhotos)
  .post(upload.single('photo'), uploadPhoto);

router.route('/:id')
  .delete(deletePhoto);

// Authenticated local secure file server
router.get('/file/:filename', serveSecurePhoto);

export default router;
