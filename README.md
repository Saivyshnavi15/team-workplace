# Real-Time Team Workspace

A collaborative workspace application built with MERN stack, featuring real-time chat, task management, file uploads, and more.

## Features

- **User Authentication**: Registration with email verification, JWT authentication, password reset
- **Role-based Authorization**: Admin and member roles
- **Workspace Management**: Create and manage teams/workspaces
- **Channels**: Public and private chat channels
- **Real-time Chat**: WebSocket-powered messaging with mentions and notifications
- **Task Management**: Create, assign, and track tasks within channels
- **File Uploads**: Upload and share documents and images
- **Activity Feed**: MongoDB aggregation pipelines for activity tracking
- **Background Jobs**: Email notifications and background processing

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io for real-time communication
- JWT for authentication
- Redis for background jobs
- Multer for file uploads
- Nodemailer for emails

### Frontend
- React 18
- Vite for build tool
- React Router for routing
- Zustand for state management
- RTK Query for server state
- Socket.io-client for real-time updates
- React Hook Form for forms

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Redis (for background jobs)

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Setup

Create `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/team-workspace
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
team-workspace-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── workers/
│   │   └── utils/
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/
    │   ├── context/
    │   ├── store/
    │   ├── api/
    │   ├── pages/
    │   ├── components/
    │   ├── hooks/
    │   └── routes/
    └── package.json
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the ISC License.