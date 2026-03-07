import { pgTable, uuid, varchar, text, timestamp, integer, boolean, jsonb, vector } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 255 }),
  industry: varchar('industry', { length: 255 }),
  experienceLevel: varchar('experience_level', { length: 50 }),
  learningStyle: varchar('learning_style', { length: 50 }),
  availableStudyHoursPerWeek: integer('available_study_hours_per_week'),
  goals: text('goals').array(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Learning topics
export const learningTopics = pgTable('learning_topics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  topicName: varchar('topic_name', { length: 255 }).notNull(),
  subtopicsKnown: text('subtopics_known').array(),
  subtopicsUnknown: text('subtopics_unknown').array(),
  confidenceLevel: integer('confidence_level'),
  currentBlockers: text('current_blockers').array(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Sources
export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 500 }),
  url: text('url'),
  filePath: text('file_path'),
  metadata: jsonb('metadata'),
  status: varchar('status', { length: 50 }).default('processing'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Source chunks for RAG
export const sourceChunks = pgTable('source_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: uuid('source_id').references(() => sources.id, { onDelete: 'cascade' }).notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 768 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Conversations
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  topicId: uuid('topic_id').references(() => learningTopics.id),
  title: varchar('title', { length: 500 }),
  startedAt: timestamp('started_at').defaultNow(),
  lastMessageAt: timestamp('last_message_at').defaultNow(),
})

// Messages
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  content: text('content').notNull(),
  inputMode: varchar('input_mode', { length: 50 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Recommendations
export const recommendations = pgTable('recommendations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  topicId: uuid('topic_id').references(() => learningTopics.id),
  conversationId: uuid('conversation_id').references(() => conversations.id),
  type: varchar('type', { length: 100 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  reasoning: text('reasoning'),
  difficultyLevel: varchar('difficulty_level', { length: 50 }),
  estimatedTimeMinutes: integer('estimated_time_minutes'),
  priorityScore: integer('priority_score'),
  externalUrl: text('external_url'),
  youtubeSnippetStart: integer('youtube_snippet_start'),
  youtubeSnippetEnd: integer('youtube_snippet_end'),
  status: varchar('status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
})

// Practice questions
export const practiceQuestions = pgTable('practice_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  topicId: uuid('topic_id').references(() => learningTopics.id),
  questionType: varchar('question_type', { length: 50 }).notNull(),
  questionText: text('question_text').notNull(),
  correctAnswer: text('correct_answer'),
  options: jsonb('options'),
  explanation: text('explanation'),
  difficulty: varchar('difficulty', { length: 50 }),
  sourceId: uuid('source_id').references(() => sources.id),
  createdAt: timestamp('created_at').defaultNow(),
})

// Practice attempts
export const practiceAttempts = pgTable('practice_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  questionId: uuid('question_id').references(() => practiceQuestions.id, { onDelete: 'cascade' }).notNull(),
  userAnswer: text('user_answer'),
  isCorrect: boolean('is_correct'),
  timeSpentSeconds: integer('time_spent_seconds'),
  hesitationDetected: boolean('hesitation_detected'),
  attemptedAt: timestamp('attempted_at').defaultNow(),
})

// Learning sessions
export const learningSessions = pgTable('learning_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  conversationId: uuid('conversation_id').references(() => conversations.id),
  startedAt: timestamp('started_at').defaultNow(),
  endedAt: timestamp('ended_at'),
  totalDurationSeconds: integer('total_duration_seconds'),
  messagesSent: integer('messages_sent').default(0),
  voiceMessages: integer('voice_messages').default(0),
  gesturesUsed: integer('gestures_used').default(0),
  practiceQuestionsAttempted: integer('practice_questions_attempted').default(0),
  implicitSignals: jsonb('implicit_signals'),
})

// Concept maps
export const conceptMaps = pgTable('concept_maps', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  topicId: uuid('topic_id').references(() => learningTopics.id).notNull(),
  nodes: jsonb('nodes').notNull(),
  edges: jsonb('edges').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  topics: many(learningTopics),
  sources: many(sources),
  conversations: many(conversations),
}))

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(messages),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}))
