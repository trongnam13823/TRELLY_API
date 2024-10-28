import ErrorResponse from '@/lib/ErrorResponse'

export default function validate({ object, zSchema, statusCode = 400 }) {
  const { data, error } = zSchema.safeParse(object)

  if (error) {
    const issue = error.issues[0]
    throw new ErrorResponse(statusCode, `${issue.path.join('.').toUpperCase()}: ${issue.message}`)
  }

  return data
}
