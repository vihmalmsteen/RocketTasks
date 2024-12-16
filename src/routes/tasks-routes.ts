import { Router } from 'express';
import { TasksController } from '../controllers/tasks-controller';
import { ensureAuthenticaded } from '../middlewares/ensure-auth'
import { verifyUserAuthorization } from '../middlewares/verifyUserAuthorization'

const tasksRoutes = Router();
const tasksController = new TasksController();

tasksRoutes.post('/', ensureAuthenticaded, verifyUserAuthorization(['admin']), tasksController.create);
tasksRoutes.get('/find', ensureAuthenticaded, verifyUserAuthorization(['admin']), tasksController.show);
tasksRoutes.put('/', ensureAuthenticaded, verifyUserAuthorization(['admin']), tasksController.update);
tasksRoutes.delete('/', ensureAuthenticaded, verifyUserAuthorization(['admin']), tasksController.delete);

export { tasksRoutes };