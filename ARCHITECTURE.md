# Life Leveling - Project Architecture & Design

## Project Overview

**Life Leveling** is a gamified personal development platform that helps users achieve their goals through task completion and progress tracking. Phase 1 focuses on building a working core prototype with authentication, task management, and an XP-based leveling system.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                              │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           React Frontend (3000)                       │   │
│  │  - Login/Register Pages                              │   │
│  │  - Dashboard                                         │   │
│  │  - Task Management UI                                │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP/REST API
┌──────────────────▼──────────────────────────────────────────┐
│              Node.js + Express (5000)                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Routes                                            │    │
│  │  /api/auth/register, /api/auth/login              │    │
│  │  /api/tasks/*                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│  ┌────────────────────────▼─────────────────────────┐     │
│  │  Controllers                                      │     │
│  │  - authController (register, login, getUser)    │     │
│  │  - taskController (CRUD + XP logic)             │     │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│  ┌────────────────────────▼────────────────────────┐      │
│  │  Services                                        │      │
│  │  - XPEngine (level calc, streaks, rewards)     │      │
│  └────────────────────────────────────────────────┘      │
│                          │                                   │
│  ┌────────────────────────▼────────────────────────┐      │
│  │  Middleware                                      │      │
│  │  - authMiddleware (JWT verification)           │      │
│  └────────────────────────────────────────────────┘      │
└──────────────────┬──────────────────────────────────────────┘
                   │ MongoDB Driver
┌──────────────────▼──────────────────────────────────────────┐
│         MongoDB Database (27017)                             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ Users        │  │ Tasks        │                         │
│  │ Collection   │  │ Collection   │                         │
│  └──────────────┘  └──────────────┘                         │
└──────────────────────────────────────────────────────────────┘
```

## Data Models

### User Model
```javascript
{
  username: String (required, unique, min 3 chars),
  email: String (required, unique),
  password: String (required, hashed with bcrypt),
  xp: Number (default: 0),
  level: Number (calculated from XP),
  streak: Number (0-based, reset if no tasks for 24h),
  lastTaskDate: Date (null if no tasks completed),
  totalTasks: Number (counter of all tasks created),
  completedTasks: Number (counter of completed tasks),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  userId: ObjectId (reference to User, required),
  title: String (required),
  description: String (optional),
  xpReward: Number (base XP, default: 10),
  difficulty: String (easy|medium|hard, default: medium),
  status: String (pending|completed|failed, default: pending),
  category: String (default: general),
  dueDate: Date (optional),
  completedAt: Date (null if not completed),
  createdAt: Date,
  updatedAt: Date
}
```

## XP System Logic

### Level Calculation
```
Level = floor(totalXP / 100) + 1

Examples:
- 0-99 XP = Level 1
- 100-199 XP = Level 2
- 200-299 XP = Level 3
```

### XP Rewards with Difficulty
```
Difficulty Multipliers:
- Easy: 1x
- Medium: 1.5x
- Hard: 2x

Example:
Task with baseXP=10:
- Easy: 10 XP
- Medium: 15 XP
- Hard: 20 XP
```

### Streak System
```
Rules:
- Completes task today? → Streak continues
- Completes task tomorrow? → Streak + 1
- Misses a day? → Streak resets to 0
- No tasks ever? → Streak = 0
```

## Authentication Flow

```
1. User Registration
   ↓
   username + email + password
   ↓
   Validate (required, unique)
   ↓
   Hash password with bcryptjs
   ↓
   Save to DB
   ↓
   Generate JWT token (expires 7 days)
   ↓
   Return token + user data

2. User Login
   ↓
   email + password
   ↓
   Find user by email
   ↓
   Compare password (bcryptjs)
   ↓
   Generate JWT token
   ↓
   Return token + user data

3. Protected Requests
   ↓
   Client includes: Authorization: Bearer <token>
   ↓
   Middleware verifies token
   ↓
   Extract userId from token
   ↓
   Attach to req.userId
   ↓
   Proceed to controller
```

## API Response Patterns

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... },
  "token": "eyJhbGc..." // if auth endpoint
}
```

### Error Response
```json
{
  "message": "Error description",
  "error": "detailed error message"
}
```

## Frontend State Management

### AuthContext
```
State:
- user: Current logged-in user
- token: JWT token
- loading: Request loading state
- isAuthenticated: Boolean flag

Functions:
- register(username, email, password)
- login(email, password)
- logout()
- fetchCurrentUser()
```

### XPContext
```
State:
- userStats: { xp, level, streak, totalTasks, completedTasks }

Functions:
- calculateLevel(totalXP)
- getXPToNextLevel(currentXP)
- getCurrentLevelXP(totalXP)
- getProgressPercentage(currentXP)
- updateStats(newStats)
```

## Component Hierarchy

```
App
├── AuthProvider
│   └── XPProvider
│       └── BrowserRouter
│           └── Routes
│               ├── Login
│               ├── Register
│               └── ProtectedRoute
│                   └── Dashboard
│                       ├── XPBar (component)
│                       ├── TaskCard (component)
│                       │   ├── [pending tasks]
│                       │   └── [completed tasks]
│                       └── Task Form
```

## File Structure

```
life-leveling/
│
├── server/
│   ├── config/
│   │   └── db.js                 (MongoDB connection)
│   ├── models/
│   │   ├── User.js               (User schema + methods)
│   │   └── Task.js               (Task schema)
│   ├── routes/
│   │   ├── authRoutes.js         (Auth endpoints)
│   │   └── taskRoutes.js         (Task endpoints)
│   ├── controllers/
│   │   ├── authController.js     (Auth logic)
│   │   └── taskController.js     (Task logic + XP)
│   ├── middleware/
│   │   └── authMiddleware.js     (JWT verification)
│   ├── services/
│   │   └── xpEngine.js           (XP calculations)
│   ├── app.js                    (Express app setup)
│   ├── server.js                 (Server entry point)
│   ├── package.json
│   └── .env.example
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── XPBar.jsx         (XP progress display)
│   │   │   └── TaskCard.jsx      (Task card component)
│   │   ├── pages/
│   │   │   ├── Login.jsx         (Login page)
│   │   │   ├── Register.jsx      (Register page)
│   │   │   └── Dashboard.jsx     (Main dashboard)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   (Auth state & logic)
│   │   │   └── XPContext.jsx     (XP state & logic)
│   │   ├── services/
│   │   │   └── api.js            (API calls)
│   │   ├── App.jsx               (Main app)
│   │   ├── main.jsx              (Entry point)
│   │   └── index.css             (Tailwind)
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env.example
│
├── docs/                         (Documentation)
├── README.md
├── SETUP.md
├── ARCHITECTURE.md              (This file)
└── .gitignore
```

## Security Considerations

1. **Password Storage**: Passwords hashed with bcryptjs (salt rounds: 10)
2. **Token Security**: JWT with 7-day expiration
3. **Input Validation**: All inputs validated on backend
4. **CORS**: Enabled to allow frontend requests
5. **Protected Routes**: All task operations require authentication
6. **Ownership Verification**: Tasks can only be modified by owner

## Performance Considerations

1. **Database Queries**: Indexed user queries by email and username
2. **Token Verification**: JWT decoded on each protected request
3. **Streaks**: Calculated on task completion, not fetched
4. **Level Calculation**: Mathematical formula, no database lookup

## Error Handling

- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 409: Conflict (duplicate user)
- 500: Server Error

## Future Enhancements (Phase 2+)

- [ ] Advanced analytics dashboard
- [ ] Daily/weekly/monthly challenges
- [ ] Achievement system
- [ ] Leaderboards and competitions
- [ ] Habit tracking with calendar view
- [ ] Notifications system
- [ ] Mobile app (React Native)
- [ ] AI-powered task suggestions
- [ ] Integration with calendar APIs
- [ ] Dark mode
- [ ] Multi-language support
