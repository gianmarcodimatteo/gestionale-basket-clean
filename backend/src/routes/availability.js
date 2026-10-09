import express from 'express';
import { getAvailabilityPlayers } from '../controllers/availabilityController.js';

const router = express.Router();

router.get('/players', getAvailabilityPlayers);

export default router;
