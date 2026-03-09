import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createChannel,
  getChannels,
  getChannel,
  updateChannel,
  deleteChannel,
  addChannelMember
} from '../controllers/channelController.js';

const router = express.Router();

// @desc    Get channels for workspace
// @route   GET /api/channels/:workspaceId
// @access  Private
router.get('/:workspaceId', protect, getChannels);

// @desc    Create new channel
// @route   POST /api/channels
// @access  Private
router.post('/', protect, createChannel);

// @desc    Get single channel
// @route   GET /api/channels/channel/:channelId
// @access  Private
router.get('/channel/:channelId', protect, getChannel);

// @desc    Update channel
// @route   PUT /api/channels/:channelId
// @access  Private
router.put('/:channelId', protect, updateChannel);

// @desc    Delete channel
// @route   DELETE /api/channels/:channelId
// @access  Private
router.delete('/:channelId', protect, deleteChannel);

// @desc    Add member to channel
// @route   POST /api/channels/:channelId/members
// @access  Private
router.post('/:channelId/members', protect, addChannelMember);

export default router;