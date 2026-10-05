# Life Leveling 🚀

A gamified personal development platform where users level up through completing tasks and maintaining streaks.

## Features

- **Gamified Progress**: Earn XP, level up, and unlock achievements
- **Task Management**: Create, organize, and track daily tasks
- **Streak Tracking**: Maintain daily streaks for habit building
- **Dashboard Analytics**: Visualize progress with charts and statistics
- **Social Features**: Compete with friends, join challenges
- **Customizable Goals**: Personalize your leveling journey

## Phase 1: Core Prototype
- Login/Register
- Dashboard
- XP system
- Tasks
- Basic leveling

## Phase 2: Enhanced Features (Planned)
- Achievements & Badges
- Leaderboards
- Social Challenges
- Mobile App
- Advanced Analytics

## Tech Stack

- **Frontend**: React + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcrypt
- **Real-time**: Socket.io
- **Testing**: Jest + React Testing Library
- **Deployment**: Docker + Docker Compose

## Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Docker (optional)

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd life-leveling

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB (if not using Docker)
mongod

# Run development servers
npm run dev
```

### Docker Setup

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/lifeleveling` |
| `JWT_SECRET` | Secret for JWT signing | Required |
| `PORT` | Backend port | `3000` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

## Project Structure

```
life-leveling/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React context providers
│   │   ├── services/       # API service layer
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration
│   └── package.json
├── docker-compose.yml      # Docker orchestration
└── README.md
```

## API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Tasks

#### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer <token>
Query: ?status=pending&category=health
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "xpReward": "number",
  "category": "health|productivity|learning|social",
  "dueDate": "ISO8601 date (optional)",
  "recurring": "daily|weekly|monthly (optional)"
}
```

#### Complete Task
```http
POST /api/tasks/:id/complete
Authorization: Bearer <token>
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "completed": "boolean"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

### User Progress

#### Get User Stats
```http
GET /api/users/stats
Authorization: Bearer <token>
```

#### Get Leaderboard
```http
GET /api/users/leaderboard
Authorization: Bearer <token>
Query: ?limit=10&period=weekly
```

## Development

### Available Scripts

```bash
# Run all development servers
npm run dev

# Run frontend only
npm run dev:client

# Run backend only
npm run dev:server

# Build for production
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Type checking
npm run typecheck
```

### Code Style
- ESLint + Prettier configured
- TypeScript strict mode enabled
- Conventional commits required

## Deployment

### Production Build
```bash
npm run build
docker-compose -f docker-compose.prod.yml up -d
```

### Environment-Specific Configs
- `docker-compose.yml` - Development
- `docker-compose.prod.yml` - Production

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## License

MIT License - see [LICENSE](LICENSE) for details.

## Roadmap

- [ ] Phase 1: Core Prototype ✓
- [ ] Phase 2: Enhanced Features
- [ ] Phase 3: Mobile Application
- [ ] Phase 4: AI-Powered Insights
- [ ] Phase 5: Community Platform

## Support

- 📧 Email: support@lifeleveling.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/life-leveling/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/life-leveling/discussions)

---

Built with ❤️ for personal growth and development