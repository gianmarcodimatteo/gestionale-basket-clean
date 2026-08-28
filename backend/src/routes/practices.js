import express from 'express';
import multer from 'multer';
import path from 'path';
import { verifyToken } from '../middleware/auth.js';
import { uploadToSpaces } from '../utils/spacesUpload.js';
import {
  getTrainingSessions,
  getTrainingSessionById,
  createTrainingSession,
  updateTrainingSession,
  deleteTrainingSession,
  uploadTrainingVideo,
} from '../controllers/practicesController.js';

const router = express.Router();

// Multer setup for video uploads (memory storage for Spaces)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow video files
  const allowedMimes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

// Middleware to upload to Spaces
const uploadToSpacesMiddleware = async (req, res, next) => {
  console.log('📤 uploadToSpacesMiddleware - req.file:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'NO FILE');
  if (req.file) {
    try {
      console.log('⏳ Uploading to Spaces...');
      const fileUrl = await uploadToSpaces(req.file, 'trainings');
      req.file.location = fileUrl;
      console.log('✅ File uploaded to Spaces:', fileUrl);
    } catch (error) {
      console.error('❌ Upload failed:', error.message);
      return res.status(500).json({ error: 'Failed to upload video' });
    }
  }
  next();
};

// Middleware for role-based access
const checkEditPermission = (req, res, next) => {
  const user = req.user;
  if (!['ADMIN', 'EDITOR', 'COACH'].includes(user?.role)) {
    return res.status(403).json({ success: false, error: 'Unauthorized - only ADMIN, EDITOR, or COACH can upload' });
  }
  next();
};

const checkDownloadPermission = (req, res, next) => {
  const user = req.user;
  if (!['ADMIN', 'EDITOR'].includes(user?.role)) {
    return res.status(403).json({ success: false, error: 'Unauthorized - only ADMIN and EDITOR can access training sessions' });
  }
  next();
};

// Routes
router.get('/', verifyToken, checkDownloadPermission, getTrainingSessions);
router.get('/:id', verifyToken, checkDownloadPermission, getTrainingSessionById);
router.post('/', verifyToken, checkEditPermission, upload.single('video'), uploadToSpacesMiddleware, createTrainingSession);
router.put('/:id', verifyToken, checkEditPermission, upload.single('video'), uploadToSpacesMiddleware, updateTrainingSession);
router.delete('/:id', verifyToken, checkEditPermission, deleteTrainingSession);
router.post('/upload/video', verifyToken, checkEditPermission, upload.single('video'), uploadToSpacesMiddleware, uploadTrainingVideo);

export default router;
