import { Router } from 'express';
import { TeamMembersController } from '../controllers/team-members-controller';
import { ensureAuthenticaded } from '../middlewares/ensure-auth'
import { verifyUserAuthorization } from '../middlewares/verifyUserAuthorization'

const teamMembersRoutes = Router();
const teamMembersController = new TeamMembersController();

teamMembersRoutes.post('/', ensureAuthenticaded, verifyUserAuthorization(['admin']), teamMembersController.create);
teamMembersRoutes.get('/find', ensureAuthenticaded, verifyUserAuthorization(['admin']), teamMembersController.show);
teamMembersRoutes.put('/', ensureAuthenticaded, verifyUserAuthorization(['admin']), teamMembersController.update);
teamMembersRoutes.delete('/', ensureAuthenticaded, verifyUserAuthorization(['admin']), teamMembersController.delete);

export { teamMembersRoutes }