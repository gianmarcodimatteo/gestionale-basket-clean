import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  addFeedback,
  getFeedback,
  deleteFeedback,
} from '../controllers/trainingFeedbackController.js';

const router = express.Router();

const checkEditPermission = (req, res, next) => {
  const user = req.user;
  if (!['ADMIN', 'EDITOR'].includes(user?.role)) {
    return res.status(403).json({ success: false, error: 'Unauthorized' });
  }
  next();
};

router.post('/', verifyToken, checkEditPermission, addFeedback);
router.get('/:trainingId', verifyToken, getFeedback);
router.delete('/:id', verifyToken, checkEditPermission, deleteFeedback);

export default router;
