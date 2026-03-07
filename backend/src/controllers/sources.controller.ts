import { Request, Response } from 'express'

export async function getSources(req: Request, res: Response) {
  // Mock sources for MVP
  res.json({
    sources: [
      {
        id: '1',
        type: 'pdf',
        title: 'Machine Learning Basics.pdf',
        status: 'ready',
        createdAt: new Date().toISOString(),
      },
    ],
  })
}
