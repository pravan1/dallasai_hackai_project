# Getting Started with LearnFlow

This guide will help you set up and run LearnFlow locally.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 20+** installed ([Download](https://nodejs.org/))
- **PostgreSQL 15+** installed ([Download](https://www.postgresql.org/download/))
- **Redis 7+** installed ([Download](https://redis.io/download))
- **pnpm** package manager (`npm install -g pnpm`)
- **Gemini API key** ([Get one here](https://makersuite.google.com/app/apikey))

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# From project root
pnpm install
```

This will install dependencies for both frontend and backend thanks to the monorepo structure.

### 2. Setup PostgreSQL Database

```bash
# Create database
createdb learnflow

# Connect to database
psql learnflow

# Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Configure Environment Variables

#### Frontend

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-secret-using-openssl-rand-base64-32
```

#### Backend

```bash
cd ../backend
cp .env.example .env
```

Edit `backend/.env`:
```env
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/learnflow
REDIS_URL=redis://localhost:6379
GOOGLE_AI_API_KEY=your-actual-gemini-api-key-here
JWT_SECRET=generate-a-secret-using-openssl-rand-base64-32

# AWS S3 (optional for MVP - leave blank)
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=

# Email (optional for MVP - leave blank)
SENDGRID_API_KEY=
FROM_EMAIL=
```

### 4. Setup Database Schema

```bash
# From backend directory
cd backend
pnpm db:push
```

This will create all necessary tables in your PostgreSQL database.

### 5. Start Redis

```bash
# On macOS with Homebrew
brew services start redis

# On Linux
sudo systemctl start redis

# On Windows (using WSL or native)
redis-server
```

### 6. Start Development Servers

Open **two terminal windows**:

#### Terminal 1 - Backend

```bash
cd backend
pnpm dev
```

You should see:
```
🚀 Server running on http://localhost:8000
📡 WebSocket server ready
🌍 Environment: development
```

#### Terminal 2 - Frontend

```bash
cd frontend
pnpm dev
```

You should see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
```

### 7. Open the Application

Navigate to: **http://localhost:3000**

You should see the LearnFlow landing page with a "Get Started" button.

## Using the Application

### Landing Page
- Click "Start Learning" or "Get Started" to enter the main application

### Main Learning Interface (3-Panel Layout)

#### Left Panel - Sources
- **Add Source**: Upload PDFs, add URLs, or link YouTube videos
- **Profile Summary**: Shows your learning profile (mock data for MVP)
- **Source List**: See all your uploaded sources

#### Center Panel - Chat
- **Text Input**: Type your questions in the input box at the bottom
- **Voice Input**: Click the microphone button to speak your question
  - Browser will ask for microphone permission (grant it)
  - Speak naturally
  - Click the stop button when done
- **Message History**: See your conversation with the AI
- **Suggested Questions**: Click on AI-generated follow-up questions
- **Sources Cited**: See which sources the AI referenced

#### Right Panel - Studio
Four tabs available:
1. **Recommendations (Sparkle icon)**:
   - See personalized next steps
   - Each recommendation shows:
     - Title and description
     - Reasoning (why it's useful)
     - Estimated time
     - Priority score (stars)
   - Click "Start" to begin a recommendation

2. **Practice (Checklist icon)**:
   - View your practice progress
   - Click "Generate Quiz" to create new questions
   - See recent performance

3. **Map (Network icon)**:
   - View key concepts and your mastery level
   - See a progress bar for each concept
   - Click "Generate" to create a new concept map

4. **Progress (Chart icon)**:
   - View learning statistics:
     - Study time today
     - Messages sent
     - Questions answered
     - Current streak
   - See weekly activity chart

### Top Navigation
- **LearnFlow Logo**: Always visible
- **Voice Toggle**: Turn voice input on/off globally
- **Gesture Toggle**: Enable/disable gesture controls
  - When enabled, you'll see a small webcam preview
  - Grant camera permission when prompted
  - Use hand gestures:
    - Swipe left: Previous question
    - Swipe right: Next question

## Testing the AI Features

### 1. Test Chat

Try these sample queries:
```
"What should I learn next about machine learning?"
"Explain gradient descent in simple terms"
"How does backpropagation work?"
"Generate practice questions on neural networks"
```

### 2. Test Voice Input

1. Click the microphone button (or toggle Voice ON in header)
2. Say: "What are activation functions?"
3. Click stop
4. The transcript appears, then AI responds

### 3. Test Recommendations

1. Go to the Recommendations tab (right panel)
2. Click "Refresh" to generate new recommendations
3. See personalized next steps based on your profile

### 4. Test Practice Questions

1. Go to the Practice tab
2. Click "Generate Quiz"
3. Answer questions and get instant feedback

## Troubleshooting

### Backend won't start

**Problem**: Database connection error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Ensure PostgreSQL is running
```bash
# Check status
pg_ctl status

# Start PostgreSQL
pg_ctl start
```

**Problem**: Missing Gemini API key
```
Error: Invalid API key
```

**Solution**: Add your Gemini API key to `backend/.env`

### Frontend won't connect to backend

**Problem**: API calls fail with CORS error

**Solution**:
1. Ensure backend is running on port 8000
2. Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
3. Restart both servers

### Voice input not working

**Problem**: Microphone button doesn't activate

**Solution**:
1. Grant microphone permission when browser asks
2. Use Chrome, Edge, or Safari (best support)
3. Check browser console for errors

### Database schema out of date

**Problem**: Database tables missing or outdated

**Solution**:
```bash
cd backend
pnpm db:push
```

## Development Tips

### Hot Reload
- Both frontend and backend support hot reload
- Changes to React components refresh automatically
- Changes to backend routes require server restart

### Debugging
- Frontend: Open browser DevTools (F12)
- Backend: Check terminal output for logs
- Database: Use Drizzle Studio
  ```bash
  cd backend
  pnpm db:studio
  ```

### Adding Mock Data

To test with more data, you can manually insert records via Drizzle Studio or psql.

## Next Steps

Now that you have LearnFlow running:

1. **Explore the Interface**: Click around, try all features
2. **Test Voice & Gestures**: Experience multimodal interaction
3. **Upload Sources**: Add PDFs or URLs (if S3 configured)
4. **Customize**: Modify prompts in `backend/src/services/GeminiService.ts`
5. **Extend**: Add new features based on the architecture

## Production Deployment

See [README.md](./README.md) for deployment instructions to:
- **Frontend**: Vercel
- **Backend**: Railway or Render
- **Database**: Supabase or Railway PostgreSQL

## Getting Help

- Check [docs/API.md](./docs/API.md) for API reference
- Check [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for system design
- Open an issue on GitHub for bugs

---

Happy learning! 🚀
