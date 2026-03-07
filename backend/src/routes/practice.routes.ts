import { Router } from 'express'
import { getQuestions, generateQuestions } from '../controllers/practice.controller.js'

const router = Router()

router.get('/questions', getQuestions)
router.post('/generate', generateQuestions)

export default router
