# CloudVault Backend

Express.js + MongoDB backend for the CloudVault file sharing application.

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cloudvault
JWT_SECRET=your-super-secret-jwt-key-change-in-production
UPLOAD_DIR=./uploads
FRONTEND_URL=http://localhost:5173
```

4. Create the uploads directory:
```bash
mkdir uploads
```

5. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile

### Files
- `POST /api/files/upload` - Upload files (multipart/form-data)
- `GET /api/files/my-files` - Get user's files
- `GET /api/files/shared-with-me` - Get files shared with user
- `GET /api/files/:id` - Get file details
- `DELETE /api/files/:id` - Delete a file
- `GET /api/files/:id/download` - Download a file
- `POST /api/files/:id/share` - Share file with users
- `POST /api/files/:id/share-link` - Generate share link
- `DELETE /api/files/:id/share-link/:linkId` - Revoke share link
- `DELETE /api/files/:id/share/:userId` - Revoke user access
- `GET /api/files/link/:token` - Access file via share link

### Users
- `GET /api/users/search?q=query` - Search users
- `GET /api/users` - Get all users

### Audit
- `GET /api/audit/file/:fileId` - Get file activity logs
- `GET /api/audit/my-activity` - Get user's activity logs

## Security Features
- JWT authentication
- Password hashing with bcrypt
- File type validation
- File size limits (50MB)
- Access control checks on all endpoints
- Share links only accessible to authenticated users

## File Structure
```
backend/
├── config/
│   └── db.js           # MongoDB connection
├── middleware/
│   └── auth.js         # JWT authentication middleware
├── models/
│   ├── User.js         # User model
│   ├── File.js         # File model
│   └── AuditLog.js     # Audit log model
├── routes/
│   ├── auth.js         # Auth routes
│   ├── files.js        # File routes
│   ├── users.js        # User routes
│   └── audit.js        # Audit routes
├── uploads/            # File storage directory
├── server.js           # Entry point
├── package.json
└── .env
```
