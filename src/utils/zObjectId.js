import { z } from 'zod'

export default z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid ObjectId' })