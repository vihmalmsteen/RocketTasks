import { Router } from 'express';
import { UsersController } from '../controllers/users-controller';
import { ensureAuthenticaded } from '../middlewares/ensure-auth'
import { verifyUserAuthorization } from '../middlewares/verifyUserAuthorization'

const usersRoutes = Router();
const usersController = new UsersController();

usersRoutes.post('/', ensureAuthenticaded, verifyUserAuthorization(['admin']), usersController.create);
usersRoutes.get('/', ensureAuthenticaded, verifyUserAuthorization(['admin','member']), usersController.index);
usersRoutes.get('/find', ensureAuthenticaded, verifyUserAuthorization(['admin']), usersController.show);
usersRoutes.put('/', ensureAuthenticaded, verifyUserAuthorization(['admin']), usersController.update);
usersRoutes.delete('/', ensureAuthenticaded, verifyUserAuthorization(['admin']), usersController.delete);

export { usersRoutes };
