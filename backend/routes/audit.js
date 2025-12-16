const express = require('express');
const AuditLog = require('../models/AuditLog');
const File = require('../models/File');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/audit/file/:fileId
// @desc    Get audit logs for a specific file
// @access  Private (owner only)
router.get('/file/:fileId', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Only owner can view file's audit logs
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const logs = await AuditLog.find({ file: req.params.fileId })
      .populate('user', 'name email')
      .populate('file', 'originalName')
      .sort({ timestamp: -1 })
      .limit(100);
    
    res.json(logs);
  } catch (error) {
    console.error('Get file audit logs error:', error);
    res.status(500).json({ message: 'Error fetching audit logs' });
  }
});

// @route   GET /api/audit/my-activity
// @desc    Get current user's activity logs
// @access  Private
router.get('/my-activity', auth, async (req, res) => {
  try {
    const logs = await AuditLog.find({ user: req.user._id })
      .populate('file', 'originalName mimeType')
      .populate('user', 'name email')
      .sort({ timestamp: -1 })
      .limit(100);
    
    res.json(logs);
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ message: 'Error fetching activity logs' });
  }
});

module.exports = router;
