import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  createClip,
  getClips,
  updateClip,
  deleteClip,
} from '../controllers/trainingClipsController.js';

const router = express.Router();

const checkEditPermission = (req, res, next) => {
  const user = req.user;
  if (!['ADMIN', 'EDITOR'].includes(user?.role)) {
    return res.status(403).json({ success: false, error: 'Unauthorized' });
  }
  next();
};

router.post('/', verifyToken, checkEditPermission, createClip);
router.get('/:trainingId', verifyToken, getClips);
router.put('/:id', verifyToken, checkEditPermission, updateClip);
router.delete('/:id', verifyToken, checkEditPermission, deleteClip);

export default router;
