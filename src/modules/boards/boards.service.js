import cloudinary from '@/providers/Cloudinary'
import boardsModel from './boards.model'
import JWTUtils from '@/lib/JWTUtils'
import ErrorResponse from '@/lib/ErrorResponse'
import usersModel from '../users/users.model'

class BoardsService {
  async create({ title, background }) {
    const userId = JWTUtils.getDecoded()._id
    // 1. Create the board
    const { insertedId } = await boardsModel.createOne(userId, title, background)
    // 2. Find the board created
    const boardCreated = await boardsModel.findOneByIdAndUserId(insertedId, userId)
    // 3. Return the board
    return boardsModel.pick(boardCreated)
  }

  async backgrounds(transform) {
    // 1. Get photos and colors
    const [photos, colors] = await Promise.all([
      cloudinary.getImagesInFolder('boards/backgrounds/photos', transform),
      cloudinary.getImagesInFolder('boards/backgrounds/colors', transform)
    ])
    // 2. Return photos and colors
    return { photos, colors }
  }

  async list(page, limit) {
    // 1. Get user id
    const userId = JWTUtils.getDecoded()._id
    // 2. Get boards
    const result = await boardsModel.findAllByUserId(userId, page, limit)
    // 3. Return boards
    return {
      data: result.data.map(boardsModel.pick),
      total: result.total
    }
  }

  async detail(id) {
    // 1. Get user id
    const userId = JWTUtils.getDecoded()._id
    // 2. Get board
    const boardFound = await boardsModel.findOneByIdAndUserId(id, userId)
    if (!boardFound) throw new ErrorResponse(404, 'Board not found or you are not a member of this board')
    // 3. Update the recent boards of the user
    const userFound = await usersModel.findOneById(userId)
    if (userFound) {
      const recentBoardsUpdated = [
        boardFound._id.toString(),
        ...(userFound.recentBoards || [])
          .map((boardId) => boardId.toString())
          .filter((boardId) => boardId !== boardFound._id.toString())
      ].slice(0, 5)
      await usersModel.updateOne(userId, { recentBoards: recentBoardsUpdated })
    }
    // 4. Return board
    return boardsModel.pick(boardFound)
  }

  async update(data) {
    const userId = JWTUtils.getDecoded()._id
    // 1. Get board
    const board = await boardsModel.findOneById(data.id)
    if (!board) throw new ErrorResponse(404, 'Board not found')
    // 2. Check if user is owner
    const isOwner = board.owners.some((owner) => owner.userId.toString() === userId)
    if (!isOwner) throw new ErrorResponse(403, 'You are not the owner of this board')
    // 3. Update board
    const boardUpdated = await boardsModel.updateOne(data.id, data)
    // 4. Return board
    return boardsModel.pick(boardUpdated)
  }
}

export default new BoardsService()
