import { Router } from 'express'
import { getSources } from '../controllers/sources.controller.js'

const router = Router()

router.get('/', getSources)

export default router
