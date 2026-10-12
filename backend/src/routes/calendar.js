import express from 'express';
import multer from 'multer';
import { verifyToken } from '../middleware/auth.js';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  acceptEvent,
  declineEvent,
  uploadOpponentLogo,
} from '../controllers/calendarController.js';

const router = express.Router();

// Middleware per verificare permessi ADMIN/EDITOR per modifica
const checkEditPermission = (req, res, next) => {
  const user = req.user;
  if (!['ADMIN', 'EDITOR'].includes(user?.role)) {
    return res.status(403).json({ success: false, error: 'Non hai permessi per modificare gli eventi' });
  }
  next();
};

const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo immagini JPEG, PNG o WebP sono permesse'));
  },
});

// POST - carica il logo dell'avversario (solo ADMIN/EDITOR)
router.post('/opponent-logo', verifyToken, checkEditPermission, logoUpload.single('logo'), uploadOpponentLogo);

// GET - recupera eventi per un range di date
router.get('/', verifyToken, getEvents);

// GET - recupera un evento specifico
router.get('/:id', verifyToken, getEventById);

// POST - crea un nuovo evento (solo ADMIN/EDITOR)
router.post('/', verifyToken, checkEditPermission, createEvent);

// PUT - aggiorna un evento (solo ADMIN/EDITOR)
router.put('/:id', verifyToken, checkEditPermission, updateEvent);

// DELETE - elimina un evento (solo ADMIN/EDITOR)
router.delete('/:id', verifyToken, checkEditPermission, deleteEvent);

// POST - accetta un invito a un evento
router.post('/:id/accept', verifyToken, acceptEvent);

// POST - rifiuta un invito a un evento
router.post('/:id/decline', verifyToken, declineEvent);

export default router;
