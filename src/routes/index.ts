import { Router } from 'express';
import { usersRoutes } from './users-routes';
import { teamMembersRoutes } from './team-members-routes';
import { teamsRoutes } from './teams-routes';
import { tasksRoutes } from './tasks-routes';
import { sessionsRoutes } from './sessions-routes';

const routes = Router();

routes.use('/users', usersRoutes);
routes.use('/team-members', teamMembersRoutes);
routes.use('/teams', teamsRoutes);
routes.use('/tasks', tasksRoutes);
routes.use('/sessions', sessionsRoutes);

export { routes };
