# Life Leveling - Setup & Running Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

## Backend Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Create `.env` file in the `server` directory:
```
MONGODB_URI=mongodb://localhost:27017/life-leveling
JWT_SECRET=your_super_secret_jwt_key_change_this
PORT=5000
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to something secure!

### 3. Start MongoDB
Make sure MongoDB is running on your system. If using local MongoDB:
```bash
mongod
```

### 4. Start the Backend Server
```bash
npm run dev
```

You should see:
```
✅ Server running on http://localhost:5000
✅ MongoDB connected
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Configure Environment Variables
Create `.env` file in the `client` directory:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Start the Frontend Development Server
```bash
npm run dev
```

You should see:
```
VITE v5.0.0  ready in XXX ms

➜  Local:   http://localhost:3000/
```

## Accessing the Application

1. Open your browser and go to: **http://localhost:3000**
2. You'll be redirected to the login page
3. Click "Register" to create a new account
4. After registration, you'll be on the dashboard

## Features Implemented (Phase 1)

### ✅ Authentication System
- Register with username, email, and password
- Login with email and password
- JWT-based session management
- Protected routes
- User profile viewing

### ✅ XP System
- Earn XP by completing tasks
- Level up automatically (100 XP per level)
- Difficulty multipliers (Easy: 1x, Medium: 1.5x, Hard: 2x)
- XP progress bar showing progress to next level
- Streak tracking (completes daily tasks to maintain streak)

### ✅ Task Management
- Create tasks with title, description, difficulty, and category
- View all pending and completed tasks
- Complete tasks to earn XP
- Track task statistics
- Delete tasks

### ✅ Dashboard
- View current level and XP
- Track active streak
- See completed tasks statistics
- Create new tasks
- Complete tasks and see XP rewards instantly

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (requires token)

### Tasks
- `POST /api/tasks` - Create new task (requires token)
- `GET /api/tasks` - Get all tasks (requires token)
- `GET /api/tasks/:taskId` - Get specific task (requires token)
- `PATCH /api/tasks/:taskId` - Update task (requires token)
- `POST /api/tasks/:taskId/complete` - Complete task and earn XP (requires token)
- `DELETE /api/tasks/:taskId` - Delete task (requires token)

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify `.env` file has correct MongoDB URI
- Check if port 5000 is available

### Frontend won't connect to backend
- Check if backend is running on port 5000
- Verify VITE_API_URL in `.env` is correct
- Check browser console for CORS errors

### Tasks not earning XP
- Ensure you're logged in
- Check that task difficulty is set correctly
- Verify XP calculation in backend logs

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (JSON Web Tokens) |
| Password Hashing | bcryptjs |

## Next Steps (Phase 2+)

- [ ] Advanced UI/UX animations
- [ ] Daily challenges
- [ ] Leaderboards
- [ ] Categories and habit tracking
- [ ] Mobile app
- [ ] AI-powered task suggestions
- [ ] Email notifications
- [ ] User profiles and social features
- [ ] Data analytics and insights
- [ ] Gamification elements (achievements, badges)
