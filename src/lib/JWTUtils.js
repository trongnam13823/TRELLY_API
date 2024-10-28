import JWT from 'jsonwebtoken'
import ErrorResponse from './ErrorResponse'

class JWTUtils {
  decoded = null

  createToken(userId, secretKey, expiresInKey) {
    const payload = { _id: userId }
    return JWT.sign(payload, process.env[secretKey], { expiresIn: process.env[expiresInKey] })
  }

  verifyToken(token, secretKey) {
    JWT.verify(token, process.env[secretKey], (err, decoded) => {
      if (err) {
        this.decoded = null
        throw new ErrorResponse(401, `TOKEN: ${err.message}`)
      }

      this.decoded = decoded
    })
  }

  getDecoded() {
    return this.decoded
  }
}

export default new JWTUtils()
