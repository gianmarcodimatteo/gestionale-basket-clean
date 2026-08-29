import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  createPlaylist,
  getPlaylists,
  getPlaylist,
  updatePlaylist,
  deletePlaylist,
  addItemToPlaylist,
  removeItemFromPlaylist,
  reorderPlaylistItems,
} from '../controllers/trainingPlaylistController.js';

const router = express.Router();

const checkEditPermission = (req, res, next) => {
  const user = req.user;
  if (!['ADMIN', 'EDITOR'].includes(user?.role)) {
    return res.status(403).json({ success: false, error: 'Unauthorized' });
  }
  next();
};

router.post('/', verifyToken, checkEditPermission, createPlaylist);
router.get('/', verifyToken, getPlaylists);
router.get('/:id', verifyToken, getPlaylist);
router.put('/:id', verifyToken, checkEditPermission, updatePlaylist);
router.delete('/:id', verifyToken, checkEditPermission, deletePlaylist);

router.post('/:playlistId/items', verifyToken, checkEditPermission, addItemToPlaylist);
router.delete('/items/:id', verifyToken, checkEditPermission, removeItemFromPlaylist);
router.put('/:playlistId/reorder', verifyToken, checkEditPermission, reorderPlaylistItems);

export default router;
