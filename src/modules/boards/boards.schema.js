import zObjectId from '@/utils/zObjectId'
import { z } from 'zod'

export const zMember = z.object({
  userId: zObjectId,
  joinedAt: z.date()
})

export const zOwner = z.object({
  userId: zObjectId,
  joinedAt: z.date()
})

export default {
  title: z.string().trim().min(1).max(255),
  background: z.string().trim(1),

  owners: z.array(zOwner).default([]),
  members: z.array(zMember).default([]),

  createdAt: z.date().nullish().default(null),
  updatedAt: z.date().nullish().default(null)
}
