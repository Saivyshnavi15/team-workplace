import Workspace from '../models/Workspace.js';
import User from '../models/User.js';

// @desc    Create new workspace
// @route   POST /api/workspaces
// @access  Private
export const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Workspace name is required'
      });
    }

    // Create workspace
    const workspace = await Workspace.create({
      name,
      description: description || '',
      owner: req.user.id,
      members: [{
        user: req.user.id,
        role: 'admin'
      }]
    });

    // Add workspace to user's workspaces
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { workspaces: workspace._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Workspace created successfully',
      workspace
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all workspaces for user
// @route   GET /api/workspaces
// @access  Private
export const getWorkspaces = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('workspaces');

    res.json({
      success: true,
      workspaces: user.workspaces || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single workspace
// @route   GET /api/workspaces/:id
// @access  Private
export const getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email avatar');

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    res.json({
      success: true,
      workspace
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update workspace
// @route   PUT /api/workspaces/:id
// @access  Private
export const updateWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    // Check if user is owner
    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only workspace owner can update'
      });
    }

    workspace.name = name || workspace.name;
    workspace.description = description || workspace.description;
    await workspace.save();

    res.json({
      success: true,
      message: 'Workspace updated successfully',
      workspace
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:id
// @access  Private
export const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    // Check if user is owner
    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only workspace owner can delete'
      });
    }

    // Remove workspace from all users
    await User.updateMany(
      { workspaces: workspace._id },
      { $pull: { workspaces: workspace._id } }
    );

    await Workspace.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Workspace deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add member to workspace
// @route   POST /api/workspaces/:id/members
// @access  Private
export const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    // Check if user is owner
    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only workspace owner can add members'
      });
    }

    // Check if already a member
    if (workspace.members.some(member => member.user.toString() === userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member'
      });
    }

    workspace.members.push({
      user: userId,
      role: 'member'
    });
    await workspace.save();

    // Add workspace to user's workspaces
    await User.findByIdAndUpdate(userId, {
      $push: { workspaces: workspace._id }
    });

    res.json({
      success: true,
      message: 'Member added successfully',
      workspace
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
