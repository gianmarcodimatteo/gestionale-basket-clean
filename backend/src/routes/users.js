import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

// Require authentication for all routes
router.use(verifyToken);

// Get all users (admin only)
router.get('/', isAdmin, getAllUsers);

// Update user role (admin only)
router.put('/:id/role', isAdmin, updateUserRole);

// Delete user (admin only)
router.delete('/:id', isAdmin, deleteUser);

export default router;
