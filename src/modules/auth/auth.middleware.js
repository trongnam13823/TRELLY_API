import JWTUtils from '@/lib/JWTUtils'

class AuthMiddleware {
  verifyAccessToken(req, res, next) {
    const token = req.headers.authorization?.substring('Bearer '.length)
    JWTUtils.verifyToken(token, 'JWT_ACCESS_TOKEN_SECRET')
    next()
  }

  verifyRefreshToken(req, res, next) {
    const token = req.cookies.refreshToken
    JWTUtils.verifyToken(token, 'JWT_REFRESH_TOKEN_SECRET')
    next()
  }
}

export default new AuthMiddleware()
