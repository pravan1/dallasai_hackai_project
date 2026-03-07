import express from 'express'
import cors from 'cors'
import chatRoutes from './routes/chat.routes.js'
import sourcesRoutes from './routes/sources.routes.js'
import recommendationsRoutes from './routes/recommendations.routes.js'
import practiceRoutes from './routes/practice.routes.js'
import profileRoutes from './routes/profile.routes.js'

const app = express()

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api/chat', chatRoutes)
app.use('/api/sources', sourcesRoutes)
app.use('/api/recommendations', recommendationsRoutes)
app.use('/api/practice', practiceRoutes)
app.use('/api/profile', profileRoutes)

// Conversations routes (chat messages)
app.use('/api/conversations', chatRoutes)

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

export default app
