import JWTUtils from '@/lib/JWTUtils'
import Cloudinary from '@/providers/Cloudinary'
import usersModel from './users.model'
import ErrorResponse from '@/lib/ErrorResponse'
import boardsModel from '../boards/boards.model'

class UsersService {
  async update(data) {
    // 1. Find the user by id
    const userFound = await usersModel.findOneById(JWTUtils.getDecoded()._id)
    if (!userFound) throw new ErrorResponse(400, 'User not found')
    // 2. Upload the avatar to Cloudinary
    if (data.avatar) {
      const { secure_url } = await Cloudinary.uploadBuffer(data.avatar.buffer)
      data.avatar = secure_url
      await Cloudinary.deleteImage(userFound.avatar)
    }
    // 3. Update the user
    const userUpdated = await usersModel.updateOne(userFound._id, data)
    if (!userUpdated) throw new ErrorResponse(400, 'User not found')
    // 4. Return the user
    return usersModel.pick(userUpdated)
  }

  async info() {
    // 1. Find the user by id
    const userFound = await usersModel.findOneById(JWTUtils.getDecoded()._id)
    if (!userFound) throw new ErrorResponse(400, 'User not found')
    // 2. Return the user
    return usersModel.pick(userFound)
  }

  async pinnedBoards() {
    const userId = JWTUtils.getDecoded()._id
    // 1. Find the user by id
    const userFound = await usersModel.findOneById(userId)
    if (!userFound) throw new ErrorResponse(400, 'User not found')
    // 2. Find the boards pinned by the user
    const boardsPinned = await boardsModel.findByIdsAndUserId(userFound.pinnedBoards, userId)
    // 3. Sort the boards by the order of the pinnedBoards array
    const boardsPinnedMap = new Map(boardsPinned.map((board) => [board._id.toString(), board]))
    const boardsPinnedSorted = userFound.pinnedBoards
      .map((boardId) => boardsPinnedMap.get(boardId.toString()))
      .filter(Boolean)
    // 4. Return the boards
    return boardsPinnedSorted.map(boardsModel.pick)
  }

  async recentBoards() {
    const userId = JWTUtils.getDecoded()._id
    // 1. Find the user by id
    const userFound = await usersModel.findOneById(userId)
    if (!userFound) throw new ErrorResponse(400, 'User not found')
    // 2. Find the boards pinned by the user
    const boardsRecent = await boardsModel.findByIdsAndUserId(userFound.recentBoards, userId)
    // 3. Sort the boards by the order of the pinnedBoards array
    const boardsRecentMap = new Map(boardsRecent.map((board) => [board._id.toString(), board]))
    const boardsRecentSorted = userFound.recentBoards
      .map((boardId) => boardsRecentMap.get(boardId.toString()))
      .filter(Boolean)
    // 4. Return the boards
    return boardsRecentSorted.map(boardsModel.pick)
  }
}

export default new UsersService()
