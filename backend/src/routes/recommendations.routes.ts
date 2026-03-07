import { Router } from 'express'
import { getRecommendations, generateRecommendations } from '../controllers/recommendations.controller.js'

const router = Router()

router.get('/', getRecommendations)
router.post('/generate', generateRecommendations)

export default router
