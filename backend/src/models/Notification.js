import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'mention',
      'message',
      'task_assigned',
      'task_due',
      'workspace_invite',
      'channel_invite',
      'task_comment',
      'task_status_change'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  data: {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace'
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel'
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
});

// Index for better performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to set expiration for certain types
notificationSchema.pre('save', function(next) {
  if (this.type === 'task_due' || this.type === 'mention') {
    // Keep these longer
    this.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
  }
  next();
});

export default mongoose.model('Notification', notificationSchema);