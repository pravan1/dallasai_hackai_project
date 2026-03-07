import { Request, Response } from 'express'
import { db } from '../db/index.js'
import { messages, conversations } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { geminiService } from '../services/GeminiService.js'

export async function sendMessage(req: Request, res: Response) {
  try {
    const { id: conversationId } = req.params
    const { content, inputMode = 'text' } = req.body

    if (!content) {
      return res.status(400).json({ error: 'Content is required' })
    }

    // Create user message
    const [userMessage] = await db
      .insert(messages)
      .values({
        conversationId,
        role: 'user',
        content,
        inputMode,
        metadata: {},
      })
      .returning()

    // Generate AI response (simplified for MVP)
    const systemPrompt = `You are an expert learning assistant helping a professional master a new topic.
Provide clear, helpful responses and cite sources when available.`

    const aiResponse = await geminiService.chat(content, [], systemPrompt)

    // Create assistant message
    const [assistantMessage] = await db
      .insert(messages)
      .values({
        conversationId,
        role: 'assistant',
        content: aiResponse.content,
        inputMode: 'text',
        metadata: aiResponse.metadata,
      })
      .returning()

    // Update conversation last message time
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId))

    res.json({
      userMessage,
      assistantMessage,
    })
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ error: 'Failed to send message' })
  }
}

export async function getMessages(req: Request, res: Response) {
  try {
    const { id: conversationId } = req.params

    // Check if conversation exists, create if not (for MVP)
    let [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))

    if (!conversation) {
      // Create default conversation for MVP
      ;[conversation] = await db
        .insert(conversations)
        .values({
          id: conversationId,
          userId: '00000000-0000-0000-0000-000000000000', // Mock user for MVP
          title: 'Learning Session',
        })
        .returning()
    }

    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt)

    res.json({ messages: conversationMessages })
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ error: 'Failed to get messages' })
  }
}
