import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [2000, 'Message cannot be more than 2000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'file', 'system'],
    default: 'text'
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  thread: {
    isThread: {
      type: Boolean,
      default: false
    },
    parentMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    replies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }]
  },
  reactions: [{
    emoji: String,
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    count: {
      type: Number,
      default: 0
    }
  }],
  edited: {
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    originalContent: String
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Index for better performance
messageSchema.index({ channel: 1, createdAt: -1 });
messageSchema.index({ author: 1 });
messageSchema.index({ 'thread.parentMessage': 1 });
messageSchema.index({ mentions: 1 });
messageSchema.index({ content: 'text' });

// Pre-save middleware to update channel's last message
messageSchema.post('save', async function() {
  if (!this.isDeleted) {
    await mongoose.model('Channel').findByIdAndUpdate(
      this.channel,
      { 
        lastMessage: this._id,
        $inc: { messageCount: 1 }
      }
    );
  }
});

// Pre-remove middleware to update channel's message count
messageSchema.pre('remove', async function() {
  await mongoose.model('Channel').findByIdAndUpdate(
    this.channel,
    { $inc: { messageCount: -1 } }
  );
});

export default mongoose.model('Message', messageSchema);