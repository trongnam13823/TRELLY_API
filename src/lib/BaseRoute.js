import { Router } from 'express'
import handleAsync from '../utils/handleAsync'

export default class BaseRoute {
  router = Router()

  constructor() {
    this.initializeMiddlewares()
    this.initializeRoutes()
  }

  // Initializes all middlewares
  initializeMiddlewares() {
    if (typeof this.middlewares !== 'function') return
    const middlewares = this.middlewares() || []
    middlewares.forEach((middleware) => this.router.use(middleware))
  }

  // Initializes all routes by method type (GET, POST, etc.)
  initializeRoutes() {
    const methods = ['post', 'get', 'put', 'delete', 'patch']
    methods.forEach((method) => this.setupMethodRoutes(method))
  }

  // Set up the routes for a specific method (GET, POST, etc.)
  setupMethodRoutes(method) {
    if (typeof this[method] !== 'function') return

    const routes = this[method]() || [] // Get routes defined for the specific HTTP method
    routes.forEach((route) => this.registerRoute(method, route)) // Register each route
  }

  // Register a specific route with its path, middlewares, and handler
  registerRoute(method, route) {
    const { path, handler, middlewares = [], routes: subRoutes } = route
    // If sub-routes exist, register them along with the parent middlewares
    if (subRoutes) {
      this.registerSubRoutes(method, route)
    } else {
      if (!path || !handler) return
      // Register the route with middlewares and the handler
      this.router[method](path, this.applyMiddlewares(middlewares), handleAsync(handler))
    }
  }

  // Registers sub-routes, inheriting parent middlewares for each sub-route
  registerSubRoutes(method, route) {
    const { routes: subRoutes, middlewares: parentMiddlewares = [] } = route

    subRoutes.forEach((subRoute) => {
      const { path, handler, middlewares: subMiddlewares = [] } = subRoute
      if (!path || !handler) return
      // Combine parent middlewares with sub-route middlewares
      const combinedMiddlewares = [...parentMiddlewares, ...subMiddlewares]
      this.router[method](path, this.applyMiddlewares(combinedMiddlewares), handleAsync(handler))
    })
  }

  // Helper function to apply middlewares (converts them to async middlewares)
  applyMiddlewares(middlewares) {
    return middlewares.map((middleware) => handleAsync(middleware))
  }
}
