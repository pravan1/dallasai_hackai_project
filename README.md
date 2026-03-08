# LearnFlow - AI-Powered Professional Learning Platform

An MVP web application inspired by NotebookLM, designed for guided professional learning with multimodal interaction (voice + gesture control).

## Features

- **3-Panel NotebookLM-style Interface**: Sources, Chat, and Studio panels
- **Voice Interaction**: Push-to-talk voice input and text-to-speech responses
- **Gesture Control**: MediaPipe-based hand tracking for navigation
- **AI-Powered Learning**: Gemini-powered personalized recommendations
- **Source Ingestion**: Upload PDFs, web URLs, and YouTube videos
- **Practice Mode**: AI-generated quizzes and scenarios
- **Progress Tracking**: Learning analytics and implicit signal detection
- **Concept Maps**: Visual learning path generation

## Tech Stack

### Frontend
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)
- Zustand (state management)
- Socket.io-client (real-time)
- Web Speech API (voice)
- MediaPipe Hands (gesture detection)

### Backend
- Node.js 20 + Express + TypeScript
- PostgreSQL + pgvector (vector search)
- Redis + BullMQ (job queue)
- Drizzle ORM
- Socket.io (WebSocket)
- Gemini API (AI/embeddings)

## Project Structure

```
learnflow/
├── frontend/          # Next.js application
├── backend/           # Express API server
├── shared/            # Shared TypeScript types
└── docs/              # Documentation
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ with pgvector extension
- Redis 7+
- pnpm (recommended) or npm

### Setup

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd learnflow
pnpm install
```

2. **Setup PostgreSQL with pgvector**:
```bash
# Install pgvector extension
CREATE EXTENSION vector;
```

3. **Configure environment variables**:
```bash
# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your values

# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

4. **Run database migrations**:
```bash
cd backend
pnpm db:push
```

5. **Start development servers**:
```bash
# Terminal 1 - Backend
cd backend
pnpm dev

# Terminal 2 - Frontend
cd frontend
pnpm dev
```

6. **Open browser**:
```
http://localhost:3000
```

## Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

### Backend (.env)
```bash
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/learnflow
REDIS_URL=redis://localhost:6379
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET_NAME=learnflow-sources
GOOGLE_AI_API_KEY=your-gemini-api-key
JWT_SECRET=your-jwt-secret
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@learnflow.ai
```

## Development

### Frontend Commands
```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # TypeScript type checking
```

### Backend Commands
```bash
pnpm dev          # Start dev server with hot reload
pnpm build        # Compile TypeScript
pnpm start        # Start production server
pnpm db:push      # Push schema changes to database
pnpm db:studio    # Open Drizzle Studio
```

## Key Features Guide

### Voice Input
- Click microphone button in chat input
- Speak your question
- Click stop when done
- AI responds with voice output

### Gesture Control
- Enable gestures from top menu
- Grant webcam permission
- Swipe right: Next question/card
- Swipe left: Previous/back

### Source Upload
1. Click "Upload" in left panel
2. Choose PDF, URL, or YouTube link
3. Wait for processing (background job)
4. Sources appear in list when ready

### Practice Mode
1. Navigate to Quiz tab in right panel
2. Click "Generate Questions"
3. Answer questions
4. Get instant feedback
5. Track your progress

## Contributing

1. Create a feature branch
2. Make changes
3. Run linting and type checks
4. Submit pull request

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
yoyo