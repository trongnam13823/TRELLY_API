import 'dotenv/config'
import mongodb from './mongodb'
import server from './server'

const PORT = process.env.PORT || 9696
const HOST = process.env.HOST || 'localhost'

server.listen(PORT, HOST, async () => {
  await mongodb.connect()
  console.log('Connected to MongoDB')
  console.log(`Server is running at http://${HOST}:${PORT}`)
})
