import { GoogleGenerativeAI } from '@google/generative-ai'

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || ''

export class GeminiService {
  private genAI: GoogleGenerativeAI
  private chatModel: any
  private embeddingModel: any

  constructor() {
    this.genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY)
    this.chatModel = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    this.embeddingModel = this.genAI.getGenerativeModel({ model: 'text-embedding-004' })
  }

  async chat(userMessage: string, conversationHistory: any[], systemPrompt: string) {
    try {
      const contents = [
        {
          role: 'user',
          parts: [{ text: systemPrompt + '\n\nUser: ' + userMessage }],
        },
      ]

      const result = await this.chatModel.generateContent({
        contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 2048,
        },
      })

      const response = result.response
      return {
        content: response.text(),
        metadata: {
          sourcesCited: [],
          suggestedQuestions: this.extractSuggestedQuestions(response.text()),
        },
      }
    } catch (error) {
      console.error('Gemini chat error:', error)
      throw new Error('Failed to generate response')
    }
  }

  async embedText(text: string): Promise<number[]> {
    try {
      const result = await this.embeddingModel.embedContent({
        content: { parts: [{ text }] },
      })

      return result.embedding.values
    } catch (error) {
      console.error('Gemini embedding error:', error)
      throw new Error('Failed to generate embedding')
    }
  }

  async generateRecommendations(profile: any, topic: any): Promise<any[]> {
    try {
      const prompt = `
Based on this learner profile, generate 3-5 personalized learning recommendations.

Profile:
- Role: ${profile.role || 'Unknown'}
- Experience Level: ${profile.experienceLevel || 'Unknown'}
- Current Topic: ${topic.topicName || 'Unknown'}
- Confidence Level: ${topic.confidenceLevel || 0}/10

Generate recommendations as a JSON array with this structure:
[
  {
    "type": "next_topic" | "practice" | "review" | "external_resource",
    "title": "Short title",
    "description": "1-2 sentence description",
    "reasoning": "Why this is useful",
    "difficultyLevel": "easy" | "medium" | "hard",
    "estimatedTimeMinutes": number,
    "priorityScore": 0.0-1.0
  }
]
`

      const result = await this.chatModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2048,
        },
      })

      const text = result.response.text()
      const jsonMatch = text.match(/\[[\s\S]*\]/)

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return []
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
      return []
    }
  }

  async generatePracticeQuestions(topic: any, count: number = 5): Promise<any[]> {
    try {
      const prompt = `
Generate ${count} practice questions for the topic: ${topic.topicName}

Return a JSON array with this structure:
[
  {
    "questionType": "multiple_choice" | "short_answer",
    "questionText": "The question",
    "correctAnswer": "The answer",
    "options": ["A", "B", "C", "D"],
    "explanation": "Why this is correct",
    "difficulty": "easy" | "medium" | "hard"
  }
]
`

      const result = await this.chatModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      })

      const text = result.response.text()
      const jsonMatch = text.match(/\[[\s\S]*\]/)

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return []
    } catch (error) {
      console.error('Failed to generate practice questions:', error)
      return []
    }
  }

  private extractSuggestedQuestions(responseText: string): string[] {
    // Simple extraction logic - in production, use better parsing
    const questions: string[] = []
    const lines = responseText.split('\n')

    for (const line of lines) {
      if (line.includes('?') && line.length < 100) {
        questions.push(line.trim())
      }
    }

    return questions.slice(0, 3)
  }
}

export const geminiService = new GeminiService()
