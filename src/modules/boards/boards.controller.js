import { z } from 'zod'
import boardsService from './boards.service'
import validate from '@/utils/validate'
import { pick } from 'lodash'
import boardsSchema from './boards.schema'
import zObjectId from '@/utils/zObjectId'

class BoardsController {

  async create(req, res, next) {
    // 1. validate request
    const dataValidated = validate({
      object: req.body,
      zSchema: z.object(pick(boardsSchema, ['title', 'background']))
    })
    // 2. call service
    const result = await boardsService.create(dataValidated)
    // 3. return response
    return res.status(200).json(result)
  }

  async backgrounds(req, res, next) {
    // 1. validate request
    const dataValidated = validate({
      object: req.query,
      zSchema: z.object({ transform: z.string().optional() })
    })
    // 2. call service
    const result = await boardsService.backgrounds(dataValidated.transform)
    // 3. return response
    return res.status(200).json(result)
  }

  async list(req, res, next) {
    // 1. validate request
    const { page, limit } = validate({
      object: req.query,
      zSchema: z.object({
        page: z.string().default('1'),
        limit: z.string().default('10')
      })
    })
    // 2. call service
    const result = await boardsService.list(parseInt(page), parseInt(limit))
    // 3. return response
    return res.status(200).json(result)
  }

  async detail(req, res, next) {
    // 1. validate request
    const { id } = validate({
      object: req.params,
      zSchema: z.object({ id: zObjectId })
    })
    // 2. call service
    const result = await boardsService.detail(id)
    // 3. return response
    return res.status(200).json(result)
  }

  async update(req, res, next) {
    // 1. validate request
    const dataValidated = validate({
      object: req.body,
      zSchema: z.object({
        id: zObjectId,
        title: boardsSchema.title.optional(),
        background: boardsSchema.background.optional()
      })
    })
    // 2. call service
    const result = await boardsService.update(dataValidated)
    // 3. return response
    return res.status(200).json(result)
  }
}

export default new BoardsController()
