import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Channel name is required'],
    trim: true,
    maxlength: [80, 'Channel name cannot be more than 80 characters']
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  type: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  messageCount: {
    type: Number,
    default: 0
  },
  settings: {
    allowFileUploads: {
      type: Boolean,
      default: true
    },
    allowThreadReplies: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Index for better performance
channelSchema.index({ workspace: 1 });
channelSchema.index({ members: 1 });
channelSchema.index({ type: 1 });
channelSchema.index({ name: 'text' });

// Pre-save middleware to add creator to members
channelSchema.pre('save', function(next) {
  if (this.isNew && this.createdBy && !this.members.includes(this.createdBy)) {
    this.members.push(this.createdBy);
  }
  next();
});

// Virtual for member count
channelSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Ensure virtual fields are serialized
channelSchema.set('toJSON', { virtuals: true });
channelSchema.set('toObject', { virtuals: true });

export default mongoose.model('Channel', channelSchema);