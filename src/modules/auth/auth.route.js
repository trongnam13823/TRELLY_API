import BaseRoute from '@/lib/BaseRoute'
import authController from './auth.controller'
import authMiddleware from './auth.middleware'

class AuthRoute extends BaseRoute {
  post() {
    return [
      {
        path: '/register',
        handler: authController.register
      },
      {
        path: '/login',
        handler: authController.login
      },
      {
        path: '/send-verify-email',
        handler: authController.sendVerifyEmail
      },
      {
        path: '/send-reset-password',
        handler: authController.sendResetPassword
      }
    ]
  }

  put() {
    return [
      {
        path: '/verify-email',
        handler: authController.verifyEmail
      },
      {
        path: '/reset-password',
        handler: authController.resetPassword
      },
      {
        middlewares: [authMiddleware.verifyAccessToken],
        routes: [
          {
            path: '/change-password',
            handler: authController.changePassword
          },
          {
            path: '/enable-2fa',
            handler: authController.enable2FA
          },
          {
            path: '/disable-2fa',
            handler: authController.disable2FA
          }
        ]
      }
    ]
  }

  get() {
    return [
      {
        path: '/refresh-token',
        middlewares: [authMiddleware.verifyRefreshToken],
        handler: authController.refreshToken
      },
      {
        middlewares: [authMiddleware.verifyAccessToken],
        routes: [
          {
            path: '/qrCode-2fa',
            handler: authController.qrCode2FA
          }
        ]
      }
    ]
  }

  delete() {
    return [
      {
        path: '/logout',
        handler: authController.logout
      }
    ]
  }
}

export default new AuthRoute().router
