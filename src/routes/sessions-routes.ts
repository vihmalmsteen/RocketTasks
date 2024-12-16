import { Router } from 'express'
import { SessionsController } from '../controllers/session-controller'

const sessionsControllers = new SessionsController()

const sessionsRoutes = Router()

sessionsRoutes.post('/', sessionsControllers.create)

export { sessionsRoutes }