import { Router } from 'express';
import { TeamsController } from '../controllers/teams-controllers';
import { ensureAuthenticaded } from '../middlewares/ensure-auth'
import { verifyUserAuthorization } from '../middlewares/verifyUserAuthorization'

const teamsRoutes = Router();
const teamsController = new TeamsController();

teamsRoutes.post('/', ensureAuthenticaded, verifyUserAuthorization(['admin']), teamsController.create);
teamsRoutes.get('/', ensureAuthenticaded, verifyUserAuthorization(['admin']), teamsController.index);
teamsRoutes.get('/find', ensureAuthenticaded, verifyUserAuthorization(['admin']), teamsController.show);
teamsRoutes.put('/', ensureAuthenticaded, verifyUserAuthorization(['admin']), teamsController.update);
teamsRoutes.delete('/', ensureAuthenticaded, verifyUserAuthorization(['admin']), teamsController.delete);

export { teamsRoutes };
