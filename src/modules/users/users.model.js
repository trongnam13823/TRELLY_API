import validate from '@/utils/validate'
import mongodb from '@/mongodb'
import usersSchema, { createAvatarUrl } from './users.schema'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { pick } from 'lodash'
import parseObjectId from '@/utils/parseObjectId'

class UsersModel {
  NAME = 'users'

  pick(object) {
    return pick(object,
      ['_id', 'fullname', 'email', 'avatar', 'isEmailVerified', 'is2FAEnabled', 'pinnedBoards', 'recentBoards']
    )
  }

  findOneByEmail(email) {
    return mongodb.getCollection(this.NAME).findOne({ email })
  }

  findOneById(_id) {
    return mongodb.getCollection(this.NAME).findOne({ _id: parseObjectId(_id) })
  }

  createOne(fullname, email, password) {
    // 1. Validate the data
    const dataValidated = validate({
      object: { fullname, email, password },
      zSchema: z.object(usersSchema).superRefine(createAvatarUrl),
      statusCode: 500
    })
    // 2. Hash the password
    dataValidated.password = bcrypt.hashSync(dataValidated.password, 10)
    // 3. Insert the data
    return mongodb.getCollection(this.NAME).insertOne(dataValidated)
  }

  updateOne(_id, data) {
    // 1. Validate the data
    const dataValidated = pick(
      data,
      ['fullname', 'avatar', 'isEmailVerified', 'is2FAEnabled', 'pinnedBoards', 'recentBoards', 'password']
    )

    // 2. Parse the board ids
    dataValidated.pinnedBoards &&= dataValidated.pinnedBoards.map(boardId => parseObjectId(boardId))
    dataValidated.recentBoards &&= dataValidated.recentBoards.map(boardId => parseObjectId(boardId))

    // 3. Update the data
    return mongodb.getCollection(this.NAME).findOneAndUpdate(
      { _id: parseObjectId(_id) },
      { $set: { ...dataValidated, updatedAt: new Date() } },
      { returnDocument: 'after', upsert: true }
    )
  }
}

export default new UsersModel()
