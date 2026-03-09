import Task from '../models/Task.js';
import Channel from '../models/Channel.js';
import Workspace from '../models/Workspace.js';

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    const { title, description, channelId, assignedTo, priority, dueDate } = req.body;

    // Validate
    if (!title || !channelId) {
      return res.status(400).json({
        success: false,
        message: 'Task title and channel ID are required'
      });
    }

    // Check if channel exists
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check if user is a member of the workspace
    const workspace = await Workspace.findById(channel.workspace);
    const isMember = workspace.members.some(member =>
      member.user.toString() === req.user.id
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this workspace'
      });
    }

    // Create task
    const task = await Task.create({
      title,
      description: description || '',
      channel: channelId,
      workspace: channel.workspace,
      createdBy: req.user.id,
      assignedTo: assignedTo || [],
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get tasks for channel
// @route   GET /api/tasks/:channelId
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const { channelId } = req.params;

    // Check if channel exists
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check if user is a member of the workspace
    const workspace = await Workspace.findById(channel.workspace);
    const isMember = workspace.members.some(member =>
      member.user.toString() === req.user.id
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this workspace'
      });
    }

    const tasks = await Task.find({
      channel: channelId
    })
    .populate('createdBy', 'name email avatar')
    .populate('assignedTo', 'name email avatar')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/task/:taskId
// @access  Private
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('channel', 'name')
      .populate('workspace', 'name')
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:taskId
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is the creator or assigned to the task
    const isCreator = task.createdBy.toString() === req.user.id;
    const isAssigned = task.assignedTo.some(user => user.toString() === req.user.id);

    if (!isCreator && !isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Only task creator or assigned users can update'
      });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.assignedTo = assignedTo || task.assignedTo;
    task.dueDate = dueDate ? new Date(dueDate) : task.dueDate;
    await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:taskId
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is the creator
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only task creator can delete'
      });
    }

    await Task.findByIdAndDelete(req.params.taskId);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get tasks for workspace (all channels)
// @route   GET /api/tasks/workspace/:workspaceId
// @access  Private
export const getWorkspaceTasks = async (req, res) => {
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

    const tasks = await Task.find({
      workspace: workspaceId
    })
    .populate('channel', 'name')
    .populate('createdBy', 'name email avatar')
    .populate('assignedTo', 'name email avatar')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};