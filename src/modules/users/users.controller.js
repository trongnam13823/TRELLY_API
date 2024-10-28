import validate from '@/utils/validate'
import { pick } from 'lodash'
import { z } from 'zod'
import usersSchema, { avatarFileSchema } from './users.schema'
import usersService from './users.service'
import zObjectId from '@/utils/zObjectId'

class UsersController {
  async update(req, res) {
    // 1. Validate the request body
    const dataValidated = validate({
      object: { ...req.body, ...(req.file ? { avatar: req.file } : {}) },
      zSchema: z.object({
        fullname: usersSchema.fullname.optional(),
        avatar: avatarFileSchema.optional(),
        pinnedBoards: z.array(zObjectId).optional()
      })
    })

    // 2. Call the service
    const result = await usersService.update(dataValidated)
    // 3. Return the result
    return res.status(200).json(result)
  }

  async info(req, res) {
    // 1. Call the service
    const result = await usersService.info()
    // 2. Return the result
    return res.status(200).json(result)
  }

  async pinnedBoards(req, res) {
    // 1. Call the service
    const result = await usersService.pinnedBoards()
    // 2. Return the result
    return res.status(200).json(result)
  }

  async recentBoards(req, res) {
    // 1. Call the service
    const result = await usersService.recentBoards()
    // 2. Return the result
    return res.status(200).json(result)
  }
}

export default new UsersController()