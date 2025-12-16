const mongoose = require('mongoose');

const sharedUserSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  permission: {
    type: String,
    enum: ['view', 'download'],
    default: 'view'
  },
  sharedAt: {
    type: Date,
    default: Date.now
  }
});

const shareLinkSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  path: {
    type: String,
    required: true
  },
  sharedWith: [sharedUserSchema],
  shareLinks: [shareLinkSchema],
  uploadDate: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

// Index for faster queries
fileSchema.index({ owner: 1 });
fileSchema.index({ 'sharedWith.user': 1 });
fileSchema.index({ 'shareLinks.token': 1 });

// Check if user has access to file
fileSchema.methods.hasAccess = function(userId) {
  // Owner always has access
  if (this.owner.toString() === userId.toString()) {
    return { hasAccess: true, isOwner: true, permission: 'download' };
  }
  
  // Check if user is in sharedWith list
  const sharedEntry = this.sharedWith.find(
    share => share.user.toString() === userId.toString()
  );
  
  if (sharedEntry) {
    return { hasAccess: true, isOwner: false, permission: sharedEntry.permission };
  }
  
  return { hasAccess: false, isOwner: false, permission: null };
};

// Check if share link is valid
fileSchema.methods.isShareLinkValid = function(token) {
  const link = this.shareLinks.find(l => l.token === token && l.isActive);
  
  if (!link) {
    return { isValid: false, reason: 'Link not found or inactive' };
  }
  
  if (link.expiresAt && new Date() > link.expiresAt) {
    return { isValid: false, reason: 'Link has expired' };
  }
  
  return { isValid: true, link };
};

module.exports = mongoose.model('File', fileSchema);
