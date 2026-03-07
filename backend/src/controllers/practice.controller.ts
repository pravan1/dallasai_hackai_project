import { Request, Response } from 'express'
import { geminiService } from '../services/GeminiService.js'

export async function getQuestions(req: Request, res: Response) {
  // Mock questions for MVP
  res.json({
    questions: [],
  })
}

export async function generateQuestions(req: Request, res: Response) {
  try {
    const { topicId, count = 5 } = req.body
    const topic = { topicName: 'Machine Learning' }

    const questions = await geminiService.generatePracticeQuestions(topic, count)

    res.json({ questions })
  } catch (error) {
    console.error('Generate questions error:', error)
    res.status(500).json({ error: 'Failed to generate questions' })
  }
}
