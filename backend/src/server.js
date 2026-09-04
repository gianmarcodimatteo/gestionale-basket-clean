// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from 'passport';
import session from 'express-session';
import './utils/passport.js';

// Routes imports
import authRoutes from './routes/auth.js';
import staffRoutes from './routes/staff.js';
import rosterRoutes from './routes/roster.js';
import calendarRoutes from './routes/calendar.js';
import practicesRoutes from './routes/practices.js';
import trainingFeedbackRoutes from './routes/trainingFeedback.js';
import trainingClipsRoutes from './routes/trainingClips.js';
import trainingPlaylistsRoutes from './routes/trainingPlaylists.js';
import playbookRoutes from './routes/playbook.js';
import scoutingRoutes from './routes/scouting.js';
import scoutingSectionsRoutes from './routes/scoutingSections.js';
import shootingStatsRoutes from './routes/shootingStats.js';
import usersRoutes from './routes/users.js';
import notificationsRoutes from './routes/notifications.js';
import dailyReportRoutes from './routes/dailyReport.js';

// Middleware imports
import { verifyToken } from './middleware/auth.js';
import { getFileStream } from './controllers/fileController.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 5000;

// ============= MIDDLEWARE =============
// Increase timeout for large file uploads (10 minutes)
app.use((req, res, next) => {
  req.setTimeout(600000); // 10 minutes for request
  res.setTimeout(600000); // 10 minutes for response
  next();
});

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://basketballmanagement.vercel.app',
    'https://whale-app-rw3dr.ondigitalocean.app'
  ],
  credentials: true,
}));

// Only parse JSON if content-type is explicitly JSON
app.use((req, res, next) => {
  if (req.is('json')) {
    return express.json({ limit: '50mb' })(req, res, next);
  }
  next();
});

// Only parse urlencoded if not multipart/form-data
app.use((req, res, next) => {
  if (req.is('urlencoded')) {
    return express.urlencoded({ extended: true, limit: '50mb' })(req, res, next);
  }
  next();
});

// Session middleware
app.use(
  session({
    secret: process.env.JWT_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax'
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============= ROUTES =============

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// File streaming route (requires authentication)
app.get('/api/files/:folder/:fileId', verifyToken, getFileStream);

// Auth routes
app.use('/api/auth', authRoutes);

// Staff routes (require authentication)
app.use('/api/staff', verifyToken, staffRoutes);

// Roster routes (require authentication)
app.use('/api/roster', verifyToken, rosterRoutes);

// Calendar routes (require authentication)
app.use('/api/calendar', verifyToken, calendarRoutes);

// Practices routes (require authentication)
app.use('/api/practices', verifyToken, practicesRoutes);

// Training Feedback routes (require authentication)
app.use('/api/training-feedback', verifyToken, trainingFeedbackRoutes);

// Training Clips routes (require authentication)
app.use('/api/training-clips', verifyToken, trainingClipsRoutes);

// Training Playlists routes (require authentication)
app.use('/api/training-playlists', verifyToken, trainingPlaylistsRoutes);

// Playbook routes (require authentication)
app.use('/api/playbook', verifyToken, playbookRoutes);

// Scouting routes (require authentication)
app.use('/api/scouting', verifyToken, scoutingRoutes);

// Scouting Sections routes (require authentication)
app.use('/api/scouting-sections', verifyToken, scoutingSectionsRoutes);

// Shooting Stats routes (require authentication)
app.use('/api/shooting-stats', verifyToken, shootingStatsRoutes);

// Users routes (admin only)
app.use('/api/users', usersRoutes);

// Notifications routes (require authentication)
app.use('/api/notifications', verifyToken, notificationsRoutes);

// Daily Report routes (require authentication)
app.use('/api/daily-reports', verifyToken, dailyReportRoutes);

// ============= FRONTEND & SPA ROUTING =============

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public')));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ============= ERROR HANDLERS =============

// Global 404 for API routes (shouldn't reach here due to SPA fallback)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============= START SERVER =============
app.listen(PORT, () => {
  console.log(`\n🏀 Gestionale Basket API`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/health`);
  console.log(`\n🔗 Google OAuth: http://localhost:${PORT}/api/auth/google`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});
