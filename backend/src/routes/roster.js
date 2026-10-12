import express from 'express';
import multer from 'multer';
import { uploadToSpaces } from '../utils/spacesUpload.js';
import {
  getAllRoster,
  getRosterById,
  createRoster,
  updateRoster,
  deleteRoster,
  updatePlayerStats,
  updatePlayTypeStats,
  getRosterStats,
} from '../controllers/rosterController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo immagini JPEG, PNG o WebP sono permesse'));
    }
  },
});

const uploadPhotoToSpaces = async (req, res, next) => {
  if (!req.file) return next();
  try {
    req.file.location = await uploadToSpaces(req.file, 'players', { acl: 'public-read' });
    next();
  } catch (error) {
    console.error('Photo upload failed:', error.message);
    res.status(500).json({ error: 'Errore nel caricamento della foto' });
  }
};

// ============= GET ROUTES =============

// Lista giocatrici
router.get('/', verifyToken, getAllRoster);

// Singola giocatrice
router.get('/:id', verifyToken, getRosterById);

// Stats roster
router.get('/stats/summary', verifyToken, getRosterStats);

// ============= CREATE ROUTES =============

// Creare giocatrice
router.post('/', verifyToken, upload.single('photo'), uploadPhotoToSpaces, createRoster);

// ============= UPDATE ROUTES =============

// Modificare giocatrice
router.put('/:id', verifyToken, upload.single('photo'), uploadPhotoToSpaces, updateRoster);

// Aggiornare stats
router.put('/:id/stats', verifyToken, updatePlayerStats);

// Aggiornare play type stats
router.put('/:id/playtypes', verifyToken, updatePlayTypeStats);

// ============= DELETE ROUTES =============

// Eliminare giocatrice
router.delete('/:id', verifyToken, deleteRoster);

export default router;
