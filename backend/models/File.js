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
    required: true
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
fileSchema.index(
  { 'shareLinks.token': 1 },
  {
    unique: true,
    partialFilterExpression: { 'shareLinks.token': { $exists: true, $type: 'string' } },
  }
);

// Check if user has access to file
fileSchema.methods.hasAccess = function(userId) {
  const ownerId = this.owner && this.owner._id ? this.owner._id.toString() : this.owner.toString();
  if (ownerId === userId.toString()) {
    return { hasAccess: true, isOwner: true, permission: 'download' };
  }
  const sharedEntry = this.sharedWith.find((share) => {
    const shareUserId = share.user && share.user._id ? share.user._id.toString() : share.user.toString();
    return shareUserId === userId.toString();
  });
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
