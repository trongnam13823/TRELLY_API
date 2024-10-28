import { MongoClient, ServerApiVersion } from 'mongodb'

class MongoDB {
  client = new MongoClient(process.env.MONGO_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true
    }
  })

  async connect() {
    return await this.client.connect()
  }

  getDatabase() {
    return this.client.db(process.env.DB_NAME)
  }

  getCollection(name) {
    return this.getDatabase().collection(name)
  }
}

export default new MongoDB()
