import validate from '@/utils/validate'
import { z } from 'zod'
import boardsSchema from './boards.schema'
import mongodb from '@/mongodb'
import { pick } from 'lodash'
import parseObjectId from '@/utils/parseObjectId'

class BoardsModel {
  NAME = 'boards'

  pick(object) {
    return pick(object, ['_id', 'userId', 'title', 'background', 'owners', 'members'])
  }

  createOne(userId, title, background) {
    // 1. Validate the data
    const dataValidated = validate({
      object: { title, background },
      zSchema: z.object(boardsSchema),
      statusCode: 500
    })
    // 2. Set some fields
    dataValidated.owners = [{ userId: parseObjectId(userId), joinedAt: new Date() }]
    dataValidated.createdAt = new Date()

    // 3. Insert the data
    return mongodb.getCollection(this.NAME).insertOne(dataValidated)
  }

  updateOne(_id, data) {
    // 1. Validate the data
    const dataValidated = pick(data, ['title', 'background'])
    // 3. Update the data
    return mongodb.getCollection(this.NAME).findOneAndUpdate(
      { _id: parseObjectId(_id) },
      { $set: { ...dataValidated, updatedAt: new Date() } },
      { returnDocument: 'after', upsert: true }
    )
  }

  async findOneById(_id) {
    return mongodb.getCollection(this.NAME).findOne({ _id: parseObjectId(_id) })
  }

  async findByIdsAndUserId(_ids, userId) {
    // 1. Convert the _ids to ObjectId
    const _idsParsed = _ids.map(parseObjectId)
    // 2. Find the boards
    return mongodb.getCollection(this.NAME).find({
      _id: { $in: _idsParsed },
      $or: [
        { owners: { $elemMatch: { userId: parseObjectId(userId) } } },
        { members: { $elemMatch: { userId: parseObjectId(userId) } } }
      ]
    }).toArray()
  }

  async findOneByIdAndUserId(_id, userId) {
    return mongodb.getCollection(this.NAME).findOne({
      _id: parseObjectId(_id),
      $or: [
        { owners: { $elemMatch: { userId: parseObjectId(userId) } } },
        { members: { $elemMatch: { userId: parseObjectId(userId) } } }
      ]
    })
  }

  async findAllByUserId(userId, page, limit) {
    const skip = page > 0 ? (page - 1) * limit : 0
    const [result] = await mongodb.getCollection(this.NAME).aggregate([
      { $match: {
        $or: [
          { owners: { $elemMatch: { userId: parseObjectId(userId) } } },
          { members: { $elemMatch: { userId: parseObjectId(userId) } } }
        ]
      } },
      {
        $facet: {
          data: [{ $sort: { 'owners.joinedAt': -1 } }, { $skip: skip }, { $limit: limit }],
          total: [{ $count: 'count' }]
        }
      }
    ]).toArray()

    return { data: result.data, total: result.total[0]?.count || 0 }
  }

  deleteOne(_id) {
    return mongodb.getCollection(this.NAME).deleteOne({ _id: parseObjectId(_id) })
  }
}

export default new BoardsModel()
