const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  platforms: [{
    type: String,
    enum: ['twitter', 'linkedin', 'instagram']
  }],
  scheduledDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed'],
    default: 'draft'
  },
  type: {
    type: String,
    enum: ['dynamic', 'static'],
    default: 'static'
  },
  mediaUrl: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', PostSchema);