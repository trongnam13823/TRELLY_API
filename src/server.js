import express from 'express'
import authRoute from '@/modules/auth/auth.route'
import cookieParser from 'cookie-parser'
import usersRoute from './modules/users/users.route'
import boardsRoute from './modules/boards/boards.route'
import cors from 'cors'
import compression from 'compression'

class Server {
  app = express()

  constructor() {
    this.middlewares()
    this.routes()
    this.catchError()
  }

  middlewares() {
    this.app.use(cors({
      origin: process.env.FRONTEND_URL,
      credentials: true
    }))

    this.app.use(express.json())
    this.app.use(cookieParser())
    this.app.use(compression())
  }

  routes() {
    this.app.use('/auth', authRoute)
    this.app.use('/users', usersRoute)
    this.app.use('/boards', boardsRoute)
  }

  catchError() {
    this.app.use((err, req, res, next) => {
      return res
        .status(err.status || 500)
        .json({
          message: err.message || 'Internal server error',
          ...(err.data || {})
        })
    })
  }
}

export default new Server().app
