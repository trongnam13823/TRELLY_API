import ErrorResponse from '@/lib/ErrorResponse'
import usersModel from '../users/users.model'
import { authenticator } from 'otplib'
import bcrypt from 'bcrypt'
import Nodemailer from '@/providers/Nodemailer'
import JWTUtils from '@/lib/JWTUtils'
import { toDataURL } from 'qrcode'

class AuthService {
  async register({ fullname, email, password }) {
    // 1. Check if the user already exists
    const userFound = await usersModel.findOneByEmail(email)
    if (userFound) throw new ErrorResponse(400, 'User already exists')
    // 2. Create a new user
    const { insertedId } = await usersModel.createOne(fullname, email, password)
    // 3. Find the user created
    const userCreated = await usersModel.findOneById(insertedId)
    // 4. Return the user
    return usersModel.pick(userCreated)
  }

  async login({ email, password, totp }) {
    // 1. Find the user by email
    const userFound = await usersModel.findOneByEmail(email)
    if (!userFound) throw new ErrorResponse(400, 'Email is not registered')
    // 2. Check is Email Verified
    if (!userFound.isEmailVerified) throw new ErrorResponse(400, 'Email is not verified')
    // 3. Check is Password correct
    if (!bcrypt.compareSync(password, userFound.password))
      throw new ErrorResponse(400, 'Invalid password')
    // 4. Check is TOTP enabled
    if (userFound.is2FAEnabled) {
      if (!totp) throw new ErrorResponse(400, 'Totp is required', { is2FAEnabled: true })
      if (!authenticator.verify({ token: totp, secret: userFound.totpSecret }))
        throw new ErrorResponse(400, 'Invalid totp')
    }
    // 4. Generate JWT token
    const [accessToken, refreshToken] = await Promise.all([
      JWTUtils.createToken(userFound._id, 'JWT_ACCESS_TOKEN_SECRET', 'JWT_ACCESS_TOKEN_EXPIRES_IN'),
      JWTUtils.createToken(userFound._id, 'JWT_REFRESH_TOKEN_SECRET', 'JWT_REFRESH_TOKEN_EXPIRES_IN')
    ])
    // 4. Return the user
    return { accessToken, refreshToken }
  }

  async sendVerifyEmail({ email }) {
    // 1. Find the user by email
    const userFound = await usersModel.findOneByEmail(email)
    if (!userFound) throw new ErrorResponse(400, 'Email is not registered')
    // 2. Generate the verify Token
    const token = JWTUtils.createToken(userFound._id, 'JWT_VERIFY_EMAIL_SECRET', 'JWT_VERIFY_EMAIL_EXPIRES_IN')
    // 3. Send the verify email
    await Nodemailer.sendMail({
      to: email,
      subject: 'Trelly - Verify your email',
      html: `
          <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${email}">
            Click here to verify your email
          </a>
      `
    })

    return { email, token }
  }

  async sendResetPassword({ email }) {
    // 1. Find the user by email
    const userFound = await usersModel.findOneByEmail(email)
    if (!userFound) throw new ErrorResponse(400, 'Email is not registered')
    // 2. Generate the verify Token
    const token = JWTUtils.createToken(userFound._id, 'JWT_RESET_PASSWORD_SECRET', 'JWT_RESET_PASSWORD_EXPIRES_IN')
    // 3. Send the verify email
    await Nodemailer.sendMail({
      to: email,
      subject: 'Trelly - Reset your password',
      html: `
          <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}">
            Click here to reset your password
          </a>
      `
    })

    return { email, token }
  }

  async verifyEmail({ token }) {
    // 1. Verify the token
    JWTUtils.verifyToken(token, 'JWT_VERIFY_EMAIL_SECRET')
    // 2. Update the user
    const userUpdated = await usersModel.updateOne(JWTUtils.getDecoded()._id, { isEmailVerified: true })
    if (!userUpdated) throw new ErrorResponse(400, 'User not found')
    // 3. Return the user
    return usersModel.pick(userUpdated)
  }

  async resetPassword({ token, password }) {
    // 1. Verify the token
    JWTUtils.verifyToken(token, 'JWT_RESET_PASSWORD_SECRET')
    // 2. Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10)
    // 3. Update the user
    const userUpdated = await usersModel.updateOne(JWTUtils.getDecoded()._id, { password: hashedPassword })
    if (!userUpdated) throw new ErrorResponse(400, 'User not found')
    // 4. Return the user
    return usersModel.pick(userUpdated)
  }

  async changePassword({ password, newPassword }) {
    // 1. Find the user by id
    const userFound = await usersModel.findOneById(JWTUtils.getDecoded()._id)
    if (!userFound) throw new ErrorResponse(400, 'User not found')
    // 2. Check is Password correct
    if (!bcrypt.compareSync(password, userFound.password))
      throw new ErrorResponse(400, 'Invalid password')
    // 3. Hash the new password
    const hashedNewPassword = bcrypt.hashSync(newPassword, 10)
    // 4. Update the user
    const userUpdated = await usersModel.updateOne(userFound._id, { password: hashedNewPassword })
    if (!userUpdated) throw new ErrorResponse(400, 'User not found')
    // 5. Return the user
    return usersModel.pick(userUpdated)
  }

  async enable2FA({ totp }) {
    // 1. Find the user by id
    const userFound = await usersModel.findOneById(JWTUtils.getDecoded()._id)
    if (!userFound) throw new ErrorResponse(400, 'User not found')
    // 2. Verify the TOTP
    if (!authenticator.verify({ token: totp, secret: userFound.totpSecret }))
      throw new ErrorResponse(400, 'Invalid totp')
    // 3. Update the user
    const userUpdated = await usersModel.updateOne(userFound._id, { is2FAEnabled: true })
    if (!userUpdated) throw new ErrorResponse(400, 'User not found')
    // 4. Return the user
    return usersModel.pick(userUpdated)
  }

  async disable2FA({ password }) {
    // 1. Find the user by id
    const userFound = await usersModel.findOneById(JWTUtils.getDecoded()._id)
    if (!userFound) throw new ErrorResponse(400, 'User not found')
    // 2. Check is Password correct
    if (!bcrypt.compareSync(password, userFound.password))
      throw new ErrorResponse(400, 'Invalid password')
    // 3. Update the user
    const userUpdated = await usersModel.updateOne(userFound._id, { is2FAEnabled: false })
    if (!userUpdated) throw new ErrorResponse(400, 'User not found')
    // 4. Return the user
    return usersModel.pick(userUpdated)
  }

  async refreshToken() {
    // 1. Generate the access token
    const accessToken = JWTUtils.createToken(
      JWTUtils.getDecoded()._id,
      'JWT_ACCESS_TOKEN_SECRET',
      'JWT_ACCESS_TOKEN_EXPIRES_IN'
    )
    // 2. Return the access token
    return { accessToken }
  }

  async qrCode2FA() {
    // 1. Find the user by id
    const userFound = await usersModel.findOneById(JWTUtils.getDecoded()._id)
    if (!userFound) throw new ErrorResponse(400, 'User not found')
    // 2. Generate the QR code
    const keyuri = authenticator.keyuri(userFound.email, 'Trelly', userFound.totpSecret)
    const qrCode = await toDataURL(keyuri)
    // 3. Return the QR code
    return { qrCode }
  }
}

export default new AuthService()
