import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getDailyReport, saveDailyReport } from '../controllers/dailyReportController.js';

const router = express.Router();

router.get('/', verifyToken, getDailyReport);
router.post('/', verifyToken, saveDailyReport);

export default router;
