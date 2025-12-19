# Quickline Backend API

Digital Queue Management System Backend built with Node.js, Express.js, and MongoDB.

## Features

- RESTful API with CRUD operations
- JWT-based authentication with refresh tokens
- Real-time updates using Socket.IO
- Input validation and sanitization
- Rate limiting and security headers
- File upload support
- MongoDB with Mongoose ODM
- Comprehensive error handling

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Seed admin user:
```bash
node src/scripts/seedAdmin.js
```

4. Start development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST `/api/auth/login` - Admin login
- POST `/api/auth/refresh` - Refresh token
- POST `/api/auth/logout` - Logout
- GET `/api/auth/verify` - Verify token

### Queue Management
- POST `/api/queue/join` - Join queue
- GET `/api/queue/ticket/:ticketId` - Get ticket status
- GET `/api/queue` - Get queue list
- POST `/api/queue/verify` - Verify ticket
- POST `/api/queue/serve-next` - Serve next ticket
- GET `/api/queue/current-serving` - Get current serving

### File Upload
- POST `/api/upload` - Upload file
- GET `/api/upload/:filename` - Get file
- DELETE `/api/upload/:filename` - Delete file

## Deployment

### PM2 Deployment
```bash
pm2 start ecosystem.config.js --env production
```

### Environment Variables
- NODE_ENV=production
- PORT=5000
- MONGODB_URI=mongodb://localhost:27017/quickline
- JWT_SECRET=your-secret-key
- CORS_ORIGIN=https://your-frontend-domain.com