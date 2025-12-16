const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['upload', 'download', 'share', 'view', 'delete', 'revoke'],
    required: true
  },
  details: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
auditLogSchema.index({ file: 1, timestamp: -1 });
auditLogSchema.index({ user: 1, timestamp: -1 });

// Static method to create audit log
auditLogSchema.statics.log = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging shouldn't break main functionality
    return null;
  }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
