import express from 'express';
import multer from 'multer';
import path from 'path';
import { verifyToken } from '../middleware/auth.js';
import { uploadToSpaces } from '../utils/spacesUpload.js';
import {
  getScoutingReports,
  getScoutingReportById,
  createScoutingReport,
  updateScoutingReport,
  deleteScoutingReport,
  deleteScoutingFile,
  createScoutingNote,
  getScoutingNotes,
  deleteScoutingNote,
  cleanupOrphanReports,
} from '../controllers/scoutingController.js';

const router = express.Router();

// Multer setup for file uploads (memory storage for Spaces)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-excel', // xls
    'application/vnd.ms-keynote', // keynote
    'application/pdf',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel, Keynote, PDF and video files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

const uploadToSpacesMiddleware = async (req, res, next) => {
  console.log('📤 uploadToSpacesMiddleware - req.file:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'NO FILE');
  if (req.file) {
    try {
      console.log('⏳ Uploading to Spaces...');
      const fileUrl = await uploadToSpaces(req.file, 'scouting');
      req.file.location = fileUrl;
      console.log('✅ File uploaded to Spaces:', fileUrl);
    } catch (error) {
      console.error('❌ Upload failed:', error.message);
      return res.status(500).json({ error: 'Failed to upload file' });
    }
  }
  next();
};

const checkEditPermission = (req, res, next) => {
  const user = req.user;
  if (!['ADMIN', 'EDITOR'].includes(user?.role)) {
    return res.status(403).json({ success: false, error: 'Unauthorized' });
  }
  next();
};

const checkDownloadPermission = (req, res, next) => {
  const user = req.user;
  if (!['ADMIN', 'EDITOR'].includes(user?.role)) {
    return res.status(403).json({ success: false, error: 'Unauthorized - only ADMIN and EDITOR can access scouting reports' });
  }
  next();
};

// Routes
router.get('/', verifyToken, checkDownloadPermission, getScoutingReports);
router.get('/:id', verifyToken, checkDownloadPermission, getScoutingReportById);
router.post('/', verifyToken, checkEditPermission, upload.single('file'), uploadToSpacesMiddleware, createScoutingReport);
router.put('/:id', verifyToken, checkEditPermission, upload.single('file'), uploadToSpacesMiddleware, updateScoutingReport);
router.delete('/:id/file', verifyToken, checkEditPermission, deleteScoutingFile);
router.delete('/:id', verifyToken, checkEditPermission, deleteScoutingReport);

// Notes routes
router.get('/:id/notes', verifyToken, getScoutingNotes);
router.post('/notes/create', verifyToken, createScoutingNote);
router.delete('/notes/:id', verifyToken, checkEditPermission, deleteScoutingNote);

// Cleanup routes
router.post('/cleanup/orphans', verifyToken, checkEditPermission, cleanupOrphanReports);

export default router;
