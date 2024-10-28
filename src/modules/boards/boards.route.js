import BaseRoute from '@/lib/BaseRoute'
import boardsController from './boards.controller'
import authMiddleware from '../auth/auth.middleware'

class BoardsRoute extends BaseRoute {
  middlewares() {
    return [authMiddleware.verifyAccessToken]
  }

  post() {
    return [
      {
        path: '/create',
        handler: boardsController.create
      }
    ]
  }

  put() {
    return [
      {
        path: '/update',
        handler: boardsController.update
      }
    ]
  }

  get() {
    return [
      {
        path: '/backgrounds',
        handler: boardsController.backgrounds
      },
      {
        path: '/list',
        handler: boardsController.list
      },
      {
        path: '/:id',
        handler: boardsController.detail
      }
    ]
  }
}

export default new BoardsRoute().router
