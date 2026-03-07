import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/learnflow'

const sql = postgres(DATABASE_URL)
export const db = drizzle(sql, { schema })
