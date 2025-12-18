# CloudVault - File Sharing Application

A full-stack file sharing application similar to Google Drive, built as part of the Fullstack Developer Assignment.

## Features

### Core Features
- **File Upload**: Support for PDF, Images, CSV, etc. with bulk upload capability (Max 50MB per file).
- **File Storage**: Files are stored securely on the backend.
- **Dashboard**: View uploaded files with metadata (filename, type, size, upload date).
- **File Sharing**:
  - Share with specific registered users (View/Download permissions).
  - Share via generated public links (Account required for access).
- **Access Control**: Secure authorization checks ensuring only permitted users can access files.

### Bonus Features Implemented
- **Link Expiry**: Set expiration times for shared links (1h, 24h, 7d).
- **Audit Log**: Track file activities including uploads, views, downloads, shares, and revocations.

## Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **Database**: MongoDB

## Prerequisites

- Node.js (v16+)
- MongoDB (Local or Atlas connection string)

## Setup Instructions

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Configure environment variables:
1. Create a `.env` file in the `backend` directory.
2. Copy the contents from `.env.example` or use the following:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cloudvault
JWT_SECRET=your_secure_secret_key
UPLOAD_DIR=./uploads
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
npm start
# Server will run on http://localhost:5000
```

### 2. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
# Frontend will run on http://localhost:5173
```

## Usage

1. Register a new account.
2. Upload files from the dashboard.
3. Click the menu on a file card to Share, Download, or Delete.
4. Check the "Activity" tab to see your audit logs.

