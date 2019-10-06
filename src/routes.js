import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.get('/', (req, res) => res.json({ message: 'Hello, Welcome to Meetapp!' }));

routes.post('/users', UserController.create);
routes.post('/sessions', SessionController.create);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

export default routes;
