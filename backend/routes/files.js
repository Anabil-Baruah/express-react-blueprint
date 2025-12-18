const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const File = require('../models/File');
const AuditLog = require('../models/AuditLog');
const { auth } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log(process.env.CLOUDINARY_CLOUD_NAME, "name")

// Configure multer for file upload
const storage = multer.memoryStorage();

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// @route   POST /api/files/upload
// @desc    Upload files
// @access  Private
router.post('/upload', auth, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    const uploadedFiles = [];
    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'cloudvault';
    
    // Helper to upload a single file buffer to Cloudinary via stream
    const uploadToCloudinary = (buffer, options) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
        stream.end(buffer);
      });
    
    for (const file of req.files) {
      // Decide resource type: images as 'image', others as 'raw'
      const isImage = file.mimetype.startsWith('image/');
      const resourceType = isImage ? 'image' : 'raw';
      
      const result = await uploadToCloudinary(file.buffer, {
        folder,
        resource_type: resourceType,
        public_id: undefined, // let Cloudinary generate
        use_filename: true,
        filename_override: file.originalname,
        overwrite: false,
      });
      
      const newFile = new File({
        filename: result.public_id,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        owner: req.user._id,
        path: result.secure_url
      });
      
      await newFile.save();
      uploadedFiles.push(newFile);
      
      await AuditLog.log({
        file: newFile._id,
        user: req.user._id,
        action: 'upload',
        details: `Uploaded ${file.originalname} to Cloudinary`,
        ipAddress: req.ip
      });
    }
    
    res.status(201).json({
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds 50MB limit' });
    }
    
    res.status(500).json({ message: error.message || 'Error uploading files' });
  }
});

// @route   GET /api/files/my-files
// @desc    Get current user's files
// @access  Private
router.get('/my-files', auth, async (req, res) => {
  try {
    const files = await File.find({ 
      owner: req.user._id,
      isDeleted: false 
    })
      .populate('sharedWith.user', 'name email')
      .sort({ uploadDate: -1 });
    
    res.json(files);
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ message: 'Error fetching files' });
  }
});

// @route   GET /api/files/shared-with-me
// @desc    Get files shared with current user
// @access  Private
router.get('/shared-with-me', auth, async (req, res) => {
  try {
    const files = await File.find({
      'sharedWith.user': req.user._id,
      isDeleted: false
    })
      .populate('owner', 'name email')
      .populate('sharedWith.user', 'name email')
      .sort({ uploadDate: -1 });
    
    res.json(files);
  } catch (error) {
    console.error('Get shared files error:', error);
    res.status(500).json({ message: 'Error fetching shared files' });
  }
});

// @route   GET /api/files/:id
// @desc    Get file details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('sharedWith.user', 'name email');
    
    if (!file || file.isDeleted) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const ownerId = file.owner && file.owner._id ? file.owner._id.toString() : file.owner.toString();
    if (ownerId === req.user._id.toString()) {
      await AuditLog.log({
        file: file._id,
        user: req.user._id,
        action: 'view',
        ipAddress: req.ip
      });
      return res.json(file);
    }
    
    const { hasAccess } = file.hasAccess(req.user._id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Log the view
    await AuditLog.log({
      file: file._id,
      user: req.user._id,
      action: 'view',
      ipAddress: req.ip
    });
    
    res.json(file);
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ message: 'Error fetching file' });
  }
});

// @route   DELETE /api/files/:id
// @desc    Delete a file
// @access  Private (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file || file.isDeleted) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Only owner can delete
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can delete this file' });
    }
    
    // Soft delete (or hard delete the actual file)
    file.isDeleted = true;
    await file.save();
    
    // Delete asset from Cloudinary
    try {
      const isImage = file.mimeType && file.mimeType.startsWith('image/');
      await cloudinary.uploader.destroy(file.filename, { resource_type: isImage ? 'image' : 'raw' });
    } catch (err) {
      console.error('Error deleting asset from Cloudinary:', err);
    }
    
    // Log the deletion
    await AuditLog.log({
      file: file._id,
      user: req.user._id,
      action: 'delete',
      details: `Deleted ${file.originalName}`,
      ipAddress: req.ip
    });
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

// @route   GET /api/files/:id/download
// @desc    Download a file
// @access  Private
router.get('/:id/download', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file || file.isDeleted) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Check access
    const { hasAccess, permission } = file.hasAccess(req.user._id);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Downloads allowed for any user with access
    
    // Log the download
    await AuditLog.log({
      file: file._id,
      user: req.user._id,
      action: 'download',
      details: `Downloaded ${file.originalName}`,
      ipAddress: req.ip
    });
    
    // Redirect to Cloudinary URL for download/stream
    res.redirect(file.path);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Error downloading file' });
  }
});

// @route   POST /api/files/:id/share
// @desc    Share file with users
// @access  Private (owner only)
router.post('/:id/share', auth, async (req, res) => {
  try {
    const { users } = req.body;
    
    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: 'Please provide users to share with' });
    }
    
    const file = await File.findById(req.params.id);
    
    if (!file || file.isDeleted) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Only owner can share
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can share this file' });
    }
    
    // Add users to sharedWith
    for (const userId of users) {
      // Check if already shared
      const existingShare = file.sharedWith.find(
        share => share.user.toString() === userId
      );
      
      if (!existingShare) {
        file.sharedWith.push({
          user: userId,
          permission: 'download'
        });
      } else {
        // Always grant full access
        existingShare.permission = 'download';
      }
    }
    
    await file.save();
    
    // Log the share
    await AuditLog.log({
      file: file._id,
      user: req.user._id,
      action: 'share',
      details: `Shared with ${users.length} user(s)`,
      ipAddress: req.ip
    });
    
    const updatedFile = await File.findById(file._id)
      .populate('sharedWith.user', 'name email');
    
    res.json(updatedFile);
  } catch (error) {
    console.error('Share error:', error);
    res.status(500).json({ message: 'Error sharing file' });
  }
});

// @route   POST /api/files/:id/share-link
// @desc    Generate a share link
// @access  Private (owner only)
router.post('/:id/share-link', auth, async (req, res) => {
  try {
    const { expiresIn } = req.body; // expiresIn in seconds
    
    const file = await File.findById(req.params.id);
    
    if (!file || file.isDeleted) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Only owner can generate share link
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can generate share links' });
    }
    
    // Generate unique token
    const token = uuidv4();
    
    // Calculate expiration
    const expiresAt = expiresIn 
      ? new Date(Date.now() + expiresIn * 1000)
      : null;
    
    file.shareLinks.push({
      token,
      expiresAt,
      isActive: true
    });
    
    await file.save();
    
    // Log the share link generation
    await AuditLog.log({
      file: file._id,
      user: req.user._id,
      action: 'share',
      details: `Generated share link${expiresAt ? ` (expires: ${expiresAt.toISOString()})` : ''}`,
      ipAddress: req.ip
    });
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/share/${token}`;
    
    res.json({ link, token, expiresAt });
  } catch (error) {
    console.error('Generate share link error:', error);
    res.status(500).json({ message: 'Error generating share link' });
  }
});

// @route   DELETE /api/files/:id/share-link/:linkId
// @desc    Revoke a share link
// @access  Private (owner only)
router.delete('/:id/share-link/:linkId', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file || file.isDeleted) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Only owner can revoke
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can revoke share links' });
    }
    
    const link = file.shareLinks.id(req.params.linkId);
    if (!link) {
      return res.status(404).json({ message: 'Share link not found' });
    }
    
    link.isActive = false;
    await file.save();
    
    // Log the revocation
    await AuditLog.log({
      file: file._id,
      user: req.user._id,
      action: 'revoke',
      details: 'Revoked share link',
      ipAddress: req.ip
    });
    
    res.json({ message: 'Share link revoked' });
  } catch (error) {
    console.error('Revoke share link error:', error);
    res.status(500).json({ message: 'Error revoking share link' });
  }
});

// @route   DELETE /api/files/:id/share/:userId
// @desc    Revoke user access
// @access  Private (owner only)
router.delete('/:id/share/:userId', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file || file.isDeleted) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Only owner can revoke
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can revoke user access' });
    }
    
    file.sharedWith = file.sharedWith.filter(
      share => share.user.toString() !== req.params.userId
    );
    
    await file.save();
    
    // Log the revocation
    await AuditLog.log({
      file: file._id,
      user: req.user._id,
      action: 'revoke',
      details: `Revoked access for user ${req.params.userId}`,
      ipAddress: req.ip
    });
    
    res.json({ message: 'User access revoked' });
  } catch (error) {
    console.error('Revoke user access error:', error);
    res.status(500).json({ message: 'Error revoking user access' });
  }
});

// @route   GET /api/files/link/:token
// @desc    Access file via share link
// @access  Private (authenticated users only)
router.get('/link/:token', auth, async (req, res) => {
  try {
    const file = await File.findOne({
      'shareLinks.token': req.params.token,
      isDeleted: false
    })
      .populate('owner', 'name email')
      .populate('sharedWith.user', 'name email');
    
    if (!file) {
      return res.status(404).json({ message: 'File not found or link is invalid' });
    }
    
    // Check if link is valid
    const { isValid, reason } = file.isShareLinkValid(req.params.token);
    
    if (!isValid) {
      return res.status(403).json({ message: reason });
    }
    
    // Log the view
    await AuditLog.log({
      file: file._id,
      user: req.user._id,
      action: 'view',
      details: 'Accessed via share link',
      ipAddress: req.ip
    });
    
    res.json(file);
  } catch (error) {
    console.error('Access via link error:', error);
    res.status(500).json({ message: 'Error accessing file' });
  }
});

module.exports = router;
