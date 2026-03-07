// User types
export interface User {
  id: string
  email: string
  name: string | null
  role: string | null
  industry: string | null
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  availableStudyHoursPerWeek: number | null
  goals: string[]
  createdAt: string
  updatedAt: string
}

// Learning topics
export interface LearningTopic {
  id: string
  userId: string
  topicName: string
  subtopicsKnown: string[]
  subtopicsUnknown: string[]
  confidenceLevel: number
  currentBlockers: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Sources
export type SourceType = 'pdf' | 'url' | 'youtube' | 'note'
export type SourceStatus = 'processing' | 'ready' | 'failed'

export interface Source {
  id: string
  userId: string
  type: SourceType
  title: string
  url: string | null
  filePath: string | null
  metadata: Record<string, any>
  status: SourceStatus
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

// Chat & messages
export interface Conversation {
  id: string
  userId: string
  topicId: string | null
  title: string
  startedAt: string
  lastMessageAt: string
}

export type MessageRole = 'user' | 'assistant'
export type InputMode = 'voice' | 'text' | 'gesture'

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  inputMode: InputMode
  metadata: {
    sourcesCited?: Array<{
      id: string
      title: string
      snippet: string
    }>
    suggestedQuestions?: string[]
  }
  createdAt: string
}

// Recommendations
export type RecommendationType = 'next_topic' | 'practice' | 'review' | 'external_resource'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'
export type RecommendationStatus = 'pending' | 'started' | 'completed' | 'skipped'

export interface YouTubeSnippet {
  url: string
  startSeconds: number
  endSeconds: number
  title: string
}

export interface Recommendation {
  id: string
  userId: string
  topicId: string | null
  conversationId: string | null
  type: RecommendationType
  title: string
  description: string
  reasoning: string
  difficultyLevel: DifficultyLevel
  estimatedTimeMinutes: number
  priorityScore: number
  externalUrl: string | null
  youtubeSnippet: YouTubeSnippet | null
  status: RecommendationStatus
  createdAt: string
  completedAt: string | null
}

// Practice
export type QuestionType = 'multiple_choice' | 'short_answer' | 'scenario'

export interface PracticeQuestion {
  id: string
  userId: string
  topicId: string | null
  questionType: QuestionType
  questionText: string
  correctAnswer: string
  options: string[] | null
  explanation: string
  difficulty: DifficultyLevel
  sourceId: string | null
  createdAt: string
}

export interface PracticeAttempt {
  id: string
  userId: string
  questionId: string
  userAnswer: string
  isCorrect: boolean
  timeSpentSeconds: number
  hesitationDetected: boolean
  attemptedAt: string
}

// Concept maps
export interface ConceptNode {
  id: string
  label: string
  level: number
  mastery?: number
}

export interface ConceptEdge {
  from: string
  to: string
  label: string
}

export interface ConceptMap {
  id: string
  userId: string
  topicId: string
  nodes: ConceptNode[]
  edges: ConceptEdge[]
  createdAt: string
  updatedAt: string
}

// Analytics
export interface LearningSession {
  id: string
  userId: string
  conversationId: string | null
  startedAt: string
  endedAt: string | null
  totalDurationSeconds: number | null
  messagesSent: number
  voiceMessages: number
  gesturesUsed: number
  practiceQuestionsAttempted: number
  implicitSignals: Record<string, any>
}

// Gesture types
export type Gesture = 'swipe-left' | 'swipe-right' | 'none'

// Voice types
export interface VoiceState {
  isRecording: boolean
  transcript: string
  isSpeaking: boolean
}
