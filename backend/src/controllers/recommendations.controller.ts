import { Request, Response } from 'express'
import { geminiService } from '../services/GeminiService.js'

export async function getRecommendations(req: Request, res: Response) {
  // Mock recommendations for MVP
  res.json({
    recommendations: [
      {
        id: '1',
        type: 'practice',
        title: 'Practice gradient descent',
        description: 'Test your understanding with 5 questions',
        reasoning: "You've read about it but haven't practiced yet",
        difficultyLevel: 'medium',
        estimatedTimeMinutes: 15,
        priorityScore: 0.9,
        status: 'pending',
      },
    ],
  })
}

export async function generateRecommendations(req: Request, res: Response) {
  try {
    const profile = { role: 'Software Engineer', experienceLevel: 'intermediate' }
    const topic = { topicName: 'Machine Learning', confidenceLevel: 5 }

    const recommendations = await geminiService.generateRecommendations(profile, topic)

    res.json({ recommendations })
  } catch (error) {
    console.error('Generate recommendations error:', error)
    res.status(500).json({ error: 'Failed to generate recommendations' })
  }
}
