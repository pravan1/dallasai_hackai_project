import { config } from 'dotenv'
config()

import { createServer } from 'http'
import app from './app.js'
import { Server } from 'socket.io'

const PORT = process.env.PORT || 8000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

const httpServer = createServer(app)

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
})

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('voice:start', () => {
    console.log('Voice session started:', socket.id)
  })

  socket.on('voice:chunk', (data) => {
    // Handle voice chunk streaming
    console.log('Voice chunk received:', socket.id)
  })

  socket.on('voice:end', () => {
    console.log('Voice session ended:', socket.id)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Export io for use in other modules
export { io }

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📡 WebSocket server ready`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})
