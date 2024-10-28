import validate from '@/utils/validate'
import { z } from 'zod'
import authService from './auth.service'
import usersSchema from '../users/users.schema'
import { pick } from 'lodash'
import ms from 'ms'

class AuthController {
  async register(req, res) {
    // 1. Validate the request body
    const dataValidated = validate({
      object: req.body,
      zSchema: z.object(pick(usersSchema, ['fullname', 'email', 'password']))
    })
    // 2. Call the service
    const result = await authService.register(dataValidated)
    // 3. Return the result
    return res.status(200).json(result)
  }

  async login(req, res) {
    // 1. Validate the request body
    const dataValidated = validate({
      object: req.body,
      zSchema: z.object({
        ...pick(usersSchema, ['email', 'password']),
        totp: z.string().length(6).optional()
      })
    })
    // 2. Call the service
    const { accessToken, refreshToken } = await authService.login(dataValidated)
    // 3. Return the result
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: ms(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN)
    })
    return res.status(200).json({ accessToken })
  }

  async sendVerifyEmail(req, res) {
    // 1. Validate the request body
    const dataValidated = validate({
      object: req.body,
      zSchema: z.object(pick(usersSchema, ['email']))
    })
    // 2. Call the service
    const result = await authService.sendVerifyEmail(dataValidated)
    // 3. Return the result
    return res.status(200).json(result)
  }

  async sendResetPassword(req, res) {
    // 1. Validate the request body
    const dataValidated = validate({
      object: req.body,
      zSchema: z.object(pick(usersSchema, ['email']))
    })
    // 2. Call the service
    const result = await authService.sendResetPassword(dataValidated)
    // 3. Return the result
    return res.status(200).json(result)
  }

  async verifyEmail(req, res) {
    // 1. Validate the request body
    const dataValidated = validate({
      object: req.body,
      zSchema: z.object({ token: z.string() })
    })
    // 2. Call the service
    const result = await authService.verifyEmail(dataValidated)
    // 3. Return the result
    return res.status(200).json(result)
  }

  async resetPassword(req, res) {
    // 1. Validate the request body
    const dataValidated = validate({
      object: req.body,
      zSchema: z.object({
        token: z.string(),
        password: usersSchema.password
      })
    })
    // 2. Call the service
    const result = await authService.resetPassword(dataValidated)
    // 3. Return the result
    return res.status(200).json(result)
  }

  async changePassword(req, res) {
    // 1. Validate the request body
    const dataValidated = validate({
      object: req.body,
      zSchema: z.object({
        password: usersSchema.password,
        newPassword: usersSchema.password
      })
    })
    // 2. Call the service
    const result = await authService.changePassword(dataValidated)
    // 3. Return the result
    return res.status(200).json(result)
  }

  async enable2FA(req, res) {
    // 1. Validate the request body
    const dataValidated = validate({
      object: req.body,
      zSchema: z.object({
        totp: z.string().length(6)
      })
    })
    // 2. Call the service
    const result = await authService.enable2FA(dataValidated)
    // 3. Return the result
    return res.status(200).json(result)
  }

  async disable2FA(req, res) {
    // 1. Validate the request body
    const dataValidated = validate({
      object: req.body,
      zSchema: z.object(pick(usersSchema, ['password']))
    })
    // 2. Call the service
    const result = await authService.disable2FA(dataValidated)
    // 3. Return the result
    return res.status(200).json(result)
  }

  async refreshToken(req, res) {
    // 1. Call the service
    const result = await authService.refreshToken()
    // 2. Return the result
    return res.status(200).json(result)
  }

  async qrCode2FA(req, res) {
    // 1. Call the service
    const result = await authService.qrCode2FA()
    // 2. Return the result
    return res.status(200).json(result)
  }

  async logout(req, res) {
    // 1. Clear the refresh token cookie
    res.clearCookie('refreshToken')
    // 2. Return the result
    return res.status(200).json()
  }
}

export default new AuthController()
