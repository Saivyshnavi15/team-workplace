import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember
} from '../controllers/workspaceController.js';

const router = express.Router();

// @desc    Get all workspaces for user
// @route   GET /api/workspaces
// @access  Private
router.get('/', protect, getWorkspaces);

// @desc    Create new workspace
// @route   POST /api/workspaces
// @access  Private
router.post('/', protect, createWorkspace);

// @desc    Get single workspace
// @route   GET /api/workspaces/:id
// @access  Private
router.get('/:id', protect, getWorkspace);

// @desc    Update workspace
// @route   PUT /api/workspaces/:id
// @access  Private
router.put('/:id', protect, updateWorkspace);

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:id
// @access  Private
router.delete('/:id', protect, deleteWorkspace);

// @desc    Add member to workspace
// @route   POST /api/workspaces/:id/members
// @access  Private
router.post('/:id/members', protect, addMember);

export default router;