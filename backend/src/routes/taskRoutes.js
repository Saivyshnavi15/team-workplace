import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getWorkspaceTasks
} from '../controllers/taskController.js';

const router = express.Router();

// @desc    Get tasks for channel
// @route   GET /api/tasks/:channelId
// @access  Private
router.get('/:channelId', protect, getTasks);

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
router.post('/', protect, createTask);

// @desc    Get single task
// @route   GET /api/tasks/task/:taskId
// @access  Private
router.get('/task/:taskId', protect, getTask);

// @desc    Update task
// @route   PUT /api/tasks/:taskId
// @access  Private
router.put('/:taskId', protect, updateTask);

// @desc    Delete task
// @route   DELETE /api/tasks/:taskId
// @access  Private
router.delete('/:taskId', protect, deleteTask);

// @desc    Get all tasks for workspace
// @route   GET /api/tasks/workspace/:workspaceId
// @access  Private
router.get('/workspace/:workspaceId', protect, getWorkspaceTasks);

export default router;