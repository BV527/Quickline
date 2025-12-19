# Quickline - Digital Queue Management System

A complete full-stack application for managing digital queues with real-time updates.

## 🚀 Features

### Frontend (React.js)
- Modern React 18 with hooks and context
- Real-time queue updates with Socket.IO
- Responsive design with TailwindCSS
- Form validation with React Hook Form + Yup
- Protected routes and authentication
- File upload support

### Backend (Node.js + Express)
- RESTful API with CRUD operations
- JWT authentication with refresh tokens
- Real-time communication with Socket.IO
- MongoDB with Mongoose ODM
- Input validation and sanitization
- Rate limiting and security headers
- File upload handling

## 📁 Project Structure

```
Quickline/
├── frontend/          # React.js frontend
├── backend/           # Node.js backend
└── deployment/        # Deployment configurations
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- MongoDB
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quickline
JWT_SECRET=your-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_USE_MOCK=false
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/logout` - Logout

### Queue Management
- `POST /api/queue/join` - Join queue
- `GET /api/queue/ticket/:id` - Get ticket status
- `GET /api/queue` - Get queue list
- `POST /api/queue/verify` - Verify ticket
- `POST /api/queue/serve-next` - Serve next ticket

## 🚀 Deployment

### Backend (EC2)
```bash
# Install PM2
npm install -g pm2

# Deploy
pm2 start ecosystem.config.js --env production
```

### Frontend (S3 + CloudFront)
```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📱 Usage

1. **Join Queue**: Users enter name and phone to get a ticket
2. **Track Status**: Real-time position updates and notifications
3. **Admin Dashboard**: Manage queue, verify tickets, serve customers
4. **Real-time Updates**: Socket.IO for live queue status

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Security headers with Helmet

## 📊 Tech Stack

**Frontend:**
- React 18
- TailwindCSS
- React Router v6
- React Hook Form
- Socket.IO Client
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.IO
- JWT
- Bcrypt
- Express Validator

**Deployment:**
- AWS EC2 (Backend)
- AWS S3 + CloudFront (Frontend)
- PM2 Process Manager
- Nginx Reverse Proxy

## 👥 Default Admin Credentials

- Username: `admin`
- Password: `admin123`

## 📄 License

MIT License