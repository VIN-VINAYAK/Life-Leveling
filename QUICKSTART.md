# Quick Start Guide

## 📋 Prerequisites Check
- ✅ Node.js v16+
- ✅ MongoDB running
- ✅ npm/yarn

## 🚀 Quick Start (TL;DR)

### Terminal 1: Backend
```bash
cd server
npm install
# Create .env file with:
# MONGODB_URI=mongodb://localhost:27017/life-leveling
# JWT_SECRET=dev_secret_key_change_this
npm run dev
```

Expected output:
```
✅ Server running on http://localhost:5000
✅ MongoDB connected
```

### Terminal 2: Frontend
```bash
cd client
npm install
npm run dev
```

Expected output:
```
VITE v5.0.0  ready in XXX ms
➜  Local:   http://localhost:3000/
```

### Open Browser
```
http://localhost:3000
```

## 🧪 Testing the App

1. **Register**
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`

2. **Create Task**
   - Title: "Read a book"
   - Difficulty: Medium
   - Click "Create Task"

3. **Complete Task**
   - Click "Complete" on the task
   - You should see +15 XP (10 base × 1.5 medium multiplier)

4. **Check Progress**
   - Level and XP should update
   - Streak should be 1

## 📁 Project Structure Summary

```
server/         → Backend (Express + MongoDB)
client/         → Frontend (React + Vite + Tailwind)
docs/           → Documentation
README.md       → Project overview
SETUP.md        → Detailed setup guide
ARCHITECTURE.md → System design & architecture
```

## 🔑 Key Technologies

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Auth | JWT, bcryptjs |

## 🚨 Common Issues & Fixes

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

### MongoDB Connection Failed
```bash
# Start MongoDB
mongod

# Or use MongoDB Atlas cloud connection
# Update MONGODB_URI in .env
```

### Frontend Can't Reach Backend
```bash
# Make sure backend is running
# Check VITE_API_URL in client/.env
# Should be: http://localhost:5000/api
```

## 📝 Available Scripts

### Backend
```bash
npm run dev    # Start with nodemon
npm start      # Start production
```

### Frontend
```bash
npm run dev    # Start dev server
npm run build  # Build for production
npm run preview # Preview production build
```

## 🎯 Next Steps

1. ✅ Start both servers
2. ✅ Register a new account
3. ✅ Create some tasks
4. ✅ Complete tasks and watch XP increase
5. ✅ Explore the dashboard

## 📚 Documentation Files

- **README.md** - Project overview and features
- **SETUP.md** - Detailed setup and API endpoints
- **ARCHITECTURE.md** - System design, data models, and flow

## 🐛 Debugging Tips

### Check Backend Logs
```bash
# Terminal should show API calls
GET /api/tasks
POST /api/tasks/:id/complete
```

### Check Frontend Logs
```bash
# Open browser DevTools (F12)
# Console tab shows network requests
# Check Network tab for API responses
```

### Test API Directly
```bash
# Get token first (register/login)
# Then test endpoints with curl or Postman

curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/tasks
```

## 🎉 Success Indicators

- ✅ Both servers running without errors
- ✅ Frontend loads at http://localhost:3000
- ✅ Can register new account
- ✅ Dashboard shows after login
- ✅ Can create and complete tasks
- ✅ XP increases when completing tasks
- ✅ Level updates correctly
- ✅ Streak tracks daily tasks

You're ready to go! 🚀
