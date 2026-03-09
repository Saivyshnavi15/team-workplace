import Channel from '../models/Channel.js';
import Workspace from '../models/Workspace.js';

// @desc    Create new channel
// @route   POST /api/channels
// @access  Private
export const createChannel = async (req, res) => {
  try {
    const { name, description, workspaceId, type = 'public' } = req.body;

    // Validate
    if (!name || !workspaceId) {
      return res.status(400).json({
        success: false,
        message: 'Channel name and workspace ID are required'
      });
    }

    // Check if workspace exists and user is a member
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    const isMember = workspace.members.some(member =>
      member.user.toString() === req.user.id
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this workspace'
      });
    }

    // Create channel
    const channel = await Channel.create({
      name,
      description: description || '',
      workspace: workspaceId,
      type,
      createdBy: req.user.id,
      members: [req.user.id] // Creator is automatically a member
    });

    // Add channel to workspace
    await Workspace.findByIdAndUpdate(workspaceId, {
      $push: { channels: channel._id }
    });

    res.status(201).json({
      success: true,
      message: 'Channel created successfully',
      channel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get channels for workspace
// @route   GET /api/channels/:workspaceId
// @access  Private
export const getChannels = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Check if workspace exists and user is a member
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    const isMember = workspace.members.some(member =>
      member.user.toString() === req.user.id
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this workspace'
      });
    }

    const channels = await Channel.find({
      workspace: workspaceId,
      isArchived: false
    }).populate('createdBy', 'name email');

    res.json({
      success: true,
      channels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single channel
// @route   GET /api/channels/channel/:channelId
// @access  Private
export const getChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId)
      .populate('workspace', 'name')
      .populate('createdBy', 'name email')
      .populate('members', 'name email avatar');

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    res.json({
      success: true,
      channel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update channel
// @route   PUT /api/channels/:channelId
// @access  Private
export const updateChannel = async (req, res) => {
  try {
    const { name, description, type } = req.body;
    const channel = await Channel.findById(req.params.channelId);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check if user is the creator or workspace owner
    const workspace = await Workspace.findById(channel.workspace);
    const isOwner = workspace.owner.toString() === req.user.id;
    const isCreator = channel.createdBy.toString() === req.user.id;

    if (!isOwner && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Only channel creator or workspace owner can update'
      });
    }

    channel.name = name || channel.name;
    channel.description = description || channel.description;
    channel.type = type || channel.type;
    await channel.save();

    res.json({
      success: true,
      message: 'Channel updated successfully',
      channel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete channel
// @route   DELETE /api/channels/:channelId
// @access  Private
export const deleteChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check if user is the creator or workspace owner
    const workspace = await Workspace.findById(channel.workspace);
    const isOwner = workspace.owner.toString() === req.user.id;
    const isCreator = channel.createdBy.toString() === req.user.id;

    if (!isOwner && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Only channel creator or workspace owner can delete'
      });
    }

    // Archive instead of delete
    channel.isArchived = true;
    await channel.save();

    res.json({
      success: true,
      message: 'Channel archived successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add member to channel
// @route   POST /api/channels/:channelId/members
// @access  Private
export const addChannelMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const channel = await Channel.findById(req.params.channelId);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check if user is a member of the workspace
    const workspace = await Workspace.findById(channel.workspace);
    const isWorkspaceMember = workspace.members.some(member =>
      member.user.toString() === userId
    );

    if (!isWorkspaceMember) {
      return res.status(400).json({
        success: false,
        message: 'User must be a workspace member first'
      });
    }

    // Check if already a channel member
    if (channel.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a channel member'
      });
    }

    channel.members.push(userId);
    await channel.save();

    res.json({
      success: true,
      message: 'Member added to channel successfully',
      channel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};