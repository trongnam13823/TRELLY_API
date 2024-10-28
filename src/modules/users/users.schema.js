import zObjectId from '@/utils/zObjectId'
import { authenticator } from 'otplib'
import { z } from 'zod'

export const createAvatarUrl = (data) => {
  data.avatar = data.avatar ? data.avatar : `https://ui-avatars.com/api/?name=${data.fullname}&background=random`
}

export const avatarFileSchema = z.object({
  mimetype: z.string().includes('image', { message: 'File must be an image' }),
  size: z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB'),
  buffer: z.instanceof(Buffer)
})

export default {
  fullname: z.string().trim().min(2).max(255),
  email: z.string().email(),
  password: z.string().trim().min(6),

  avatar: z.string().optional(),

  isEmailVerified: z.boolean().default(false),

  totpSecret: z.string().default(authenticator.generateSecret()),
  is2FAEnabled: z.boolean().default(false),

  pinnedBoards: z.array(zObjectId).default([]),
  recentBoards: z.array(zObjectId).default([]),

  createdAt: z.date().nullish().default(null),
  updatedAt: z.date().nullish().default(null)
}
