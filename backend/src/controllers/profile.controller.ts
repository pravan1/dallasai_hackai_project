import { Request, Response } from 'express'

export async function getProfile(req: Request, res: Response) {
  // Mock profile for MVP
  res.json({
    profile: {
      id: '1',
      name: 'Demo User',
      email: 'demo@learnflow.ai',
      role: 'Software Engineer',
      industry: 'Technology',
      experienceLevel: 'intermediate',
      learningStyle: 'visual',
      availableStudyHoursPerWeek: 10,
      goals: ['Learn Machine Learning', 'Build AI projects'],
    },
  })
}
