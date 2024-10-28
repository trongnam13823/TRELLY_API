import { ObjectId } from 'mongodb'

export default function parseObjectId(id) {
  return typeof id === 'string' ? new ObjectId(id) : id
}
