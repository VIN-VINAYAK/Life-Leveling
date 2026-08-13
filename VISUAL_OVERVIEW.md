# Life Leveling - Visual Overview & Getting Started

## 🎯 What is Life Leveling?

A **gamified personal development platform** that turns your daily tasks into an RPG-style leveling system. Complete tasks → Earn XP → Level up → Maintain streaks.

---

## 📸 Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│ USER NOT LOGGED IN                                          │
└───────────────────────────────────────────────────────────┬─┘
                                                             │
                            ┌────────────┬────────────┐      │
                            │            │            │      │
                            ▼            ▼            ▼      │
                    ┌──────────────┐ ┌──────────┐ ┌──────┐   │
                    │   REGISTER   │ │  LOGIN   │ │ HOME │   │
                    └──────────────┘ └──────────┘ └──────┘   │
                                          │                   │
                    ┌─────────────────────┴─────────────────┐ │
                    │                                       │ │
                    ▼ (Authentication Success)              │ │
┌─────────────────────────────────────────────────────────────┤ │
│ DASHBOARD                                                  │ │
│  ┌─────────────────────────────────────────────────────┐  │ │
│  │ USER STATS                                          │  │ │
│  │  Level: 5  │  XP: 425  │  Streak: 🔥 3  │ Tasks: 7/12 │  │ │
│  └─────────────────────────────────────────────────────┘  │ │
│  ┌─────────────────────────────────────────────────────┐  │ │
│  │ XP PROGRESS BAR                                     │  │ │
│  │ ████████░░░░░░░░  (42%)                            │  │ │
│  │ 25 XP to next level                                │  │ │
│  └─────────────────────────────────────────────────────┘  │ │
│  ┌─────────────────────────────────────────────────────┐  │ │
│  │ PENDING TASKS (7)                                  │  │ │
│  │  ┌─────────────────────────────────────────────┐   │  │ │
│  │  │ Read Chapter 5          [MEDIUM] +15 XP     │   │  │ │
│  │  │ Description: Study for exam                 │   │  │ │
│  │  │                              [COMPLETE]     │   │  │ │
│  │  └─────────────────────────────────────────────┘   │  │ │
│  │  ┌─────────────────────────────────────────────┐   │  │ │
│  │  │ Morning Exercise         [HARD] +20 XP      │   │  │ │
│  │  │ Description: 30 min cardio                  │   │  │ │
│  │  │                              [COMPLETE]     │   │  │ │
│  │  └─────────────────────────────────────────────┘   │  │ │
│  │  [+ NEW TASK]                                      │  │ │
│  └─────────────────────────────────────────────────────┘  │ │
│  ┌─────────────────────────────────────────────────────┐  │ │
│  │ COMPLETED TASKS (5)                                │  │ │
│  │  ✅ Code Review (completed 2 hours ago)           │  │ │
│  │  ✅ Buy Groceries (completed yesterday)           │  │ │
│  └─────────────────────────────────────────────────────┘  │ │
└─────────────────────────────────────────────────────────────┤ │
                    │                                       │ │
                    └──────────────────────────────────────┘ │
                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Example Gameplay

### Scenario: New User "Alex"

**Day 1:**
```
Alex registers → Level 1, 0 XP, Streak: 0
Creates task: "Learn JavaScript" (Medium, 10 XP)
Completes task: +15 XP earned (10 × 1.5 multiplier)
Result: Level 1, 15 XP, Streak: 1 🔥
```

**Day 2:**
```
Alex creates 2 tasks:
  "Read Chapter 2" (Easy, 10 XP)
  "Workout 30 min" (Hard, 20 XP)
Completes both:
  Task 1: +10 XP (10 × 1.0)
  Task 2: +40 XP (20 × 2.0)
  Total: +50 XP
Result: Level 1, 65 XP, Streak: 2 🔥🔥
```

**Day 3 (Misses tasks):**
```
Alex doesn't complete any tasks
Logs in next day
Result: Level 1, 65 XP, Streak: 0 (RESET!)
```

**Day 4:**
```
Alex completes 1 task: "Meditate" (Easy, 10 XP)
Result: Level 1, 75 XP, Streak: 1 🔥 (Restarted)
```

**Day 5:**
```
Alex completes 2 tasks:
  Task 1: +15 XP
  Task 2: +30 XP
  Total: +45 XP
Result: Level 2, 20 XP (100 XP threshold crossed!), Streak: 2 🔥🔥
```

---

## 🎮 Gamification Mechanics

### XP & Levels
```
Total XP: 0-99      → Level 1
Total XP: 100-199   → Level 2
Total XP: 200-299   → Level 3
Total XP: 300-399   → Level 4
... and so on
```

### Difficulty Multipliers
```
┌───────────┬──────┬─────────────┐
│ Difficulty│Mult. │ Example (10)│
├───────────┼──────┼─────────────┤
│ Easy      │ 1.0x │ +10 XP      │
│ Medium    │ 1.5x │ +15 XP      │
│ Hard      │ 2.0x │ +20 XP      │
└───────────┴──────┴─────────────┘
```

### Streak System
```
✅ Task completed today? → Streak continues
✅ Task completed tomorrow? → Streak +1
❌ Missed a day? → Streak resets to 0

Streak visualized as: 🔥 🔥 🔥 (3-day streak)
```

---

## 🗂 What Each File Does

### Backend Files

**Authentication**
```
authController.js  → Handles register, login, user info
authRoutes.js      → API endpoints for auth
authMiddleware.js  → Validates JWT tokens
```

**Tasks**
```
taskController.js  → Create/update/complete tasks, award XP
taskRoutes.js      → Task API endpoints
```

**Core Logic**
```
xpEngine.js        → Calculates levels, streaks, XP rewards
User.js            → User data model
Task.js            → Task data model
```

### Frontend Files

**Pages**
```
Login.jsx          → Login form
Register.jsx       → Registration form
Dashboard.jsx      → Main dashboard
```

**Components**
```
XPBar.jsx          → Progress bar display
TaskCard.jsx       → Individual task card
```

**State Management**
```
AuthContext.jsx    → Manages login/user state
XPContext.jsx      → Manages XP/level calculations
```

---

## 🚦 Running the Application

### Step 1: Open 2 Terminals

**Terminal 1 - Backend:**
```bash
cd server
npm install
# Copy .env.example to .env
npm run dev
# Wait for: ✅ Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm run dev
# Wait for: ➜  Local:   http://localhost:3000/
```

### Step 2: Open Browser
```
http://localhost:3000
```

### Step 3: Test It Out
1. Click "Register"
2. Enter: `testuser` / `test@example.com` / `password123`
3. Click "Register"
4. Create a task: "Test Task" / Medium
5. Click "Complete"
6. See XP increase! ✨

---

## 🔑 Key Concepts

### What is JWT?
- **JWT** = JSON Web Token
- Proves you're logged in without storing sessions
- Sent with every request: `Authorization: Bearer <token>`
- Expires after 7 days

### What is MongoDB?
- **NoSQL database** that stores data as JSON-like documents
- Stores Users and Tasks
- Connected with Mongoose (Node.js library)

### What is Vite?
- **Fast build tool** for React
- Replaces older Create React App
- Hot module reloading (sees changes instantly)

### What is Tailwind CSS?
- **Utility-first CSS framework**
- Pre-made classes for styling: `bg-blue-600`, `text-white`, etc.
- No writing CSS files, just add classes

---

## 🔗 API Examples

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john",
    "email": "john@example.com",
    "xp": 0,
    "level": 1,
    "streak": 0
  }
}
```

### Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "title": "Learn MongoDB",
    "description": "Complete the tutorial",
    "difficulty": "medium",
    "category": "learning",
    "xpReward": 10
  }'
```

### Complete Task
```bash
curl -X POST http://localhost:5000/api/tasks/507f1f77bcf86cd799439011/complete \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

Response:
```json
{
  "message": "Task completed successfully",
  "xpAwarded": 15,
  "userStats": {
    "xp": 15,
    "level": 1,
    "streak": 1,
    "completedTasks": 1
  }
}
```

---

## 📋 Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| Backend won't start | Check MongoDB is running (`mongod`) |
| Frontend won't load | Check backend is running on 5000 |
| Login fails | Check .env has correct JWT_SECRET |
| Tasks won't save | Check browser console for errors |
| XP not increasing | Hard refresh page (Ctrl+Shift+R) |

---

## 📚 Documentation Files

```
README.md           ← Overview & features
SETUP.md            ← Detailed setup guide
ARCHITECTURE.md     ← System design & data models
QUICKSTART.md       ← Quick commands
COMPLETION_REPORT.md ← What was built
```

---

## 🎯 Next Steps After Phase 1

Phase 1 is complete! Next phases could include:

**Phase 2:**
- Daily challenges
- Achievement system
- Leaderboards
- Dark mode
- Email notifications

**Phase 3:**
- Mobile app
- Social features
- AI suggestions
- Cloud deployment
- Advanced analytics

---

## 🎉 Ready to Go!

You now have a fully functional game-like app that:
✅ Manages user accounts
✅ Tracks task completion
✅ Awards XP for difficulty
✅ Levels players up
✅ Maintains streaks

**Start the servers, register, create tasks, and level up!** 🚀
