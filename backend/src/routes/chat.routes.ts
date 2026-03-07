import { Router } from 'express'
import { sendMessage, getMessages } from '../controllers/chat.controller.js'

const router = Router()

// POST /api/conversations/:id/messages - Send a message
router.post('/:id/messages', sendMessage)

// GET /api/conversations/:id/messages - Get conversation messages
router.get('/:id/messages', getMessages)

export default router
