import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getShootingStats,
  createShootingStats,
  updateShootingStats,
  deleteShootingStats,
  deleteAllShootingStats,
} from '../controllers/shootingStatsController.js';

const router = express.Router();

const checkEditPermission = (req, res, next) => {
  const user = req.user;
  if (!['ADMIN', 'EDITOR', 'COACH'].includes(user?.role)) {
    return res.status(403).json({ success: false, error: 'Unauthorized' });
  }
  next();
};

router.get('/', verifyToken, getShootingStats);
router.post('/', verifyToken, checkEditPermission, createShootingStats);
router.put('/:id', verifyToken, checkEditPermission, updateShootingStats);
router.delete('/:id', verifyToken, checkEditPermission, deleteShootingStats);
router.delete('/all/records', verifyToken, checkEditPermission, deleteAllShootingStats);

export default router;
