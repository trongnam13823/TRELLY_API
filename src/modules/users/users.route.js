import BaseRoute from '@/lib/BaseRoute'
import authMiddleware from '../auth/auth.middleware'
import usersController from './users.controller'
import multer from 'multer'

class UsersRoute extends BaseRoute {
  middlewares() {
    return [authMiddleware.verifyAccessToken]
  }

  put() {
    return [
      {
        path: '/update',
        middlewares: [multer().single('avatar')],
        handler: usersController.update
      }
    ]
  }

  get() {
    return [
      {
        path: '/info',
        handler: usersController.info
      },
      {
        path: '/pinnedBoards',
        handler: usersController.pinnedBoards
      },
      {
        path: '/recentBoards',
        handler: usersController.recentBoards
      }
    ]
  }
}

export default new UsersRoute().router
