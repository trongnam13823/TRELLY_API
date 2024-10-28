import { v2 as cloudinary } from 'cloudinary'
import { extractPublicId } from 'cloudinary-build-url'
import streamifier from 'streamifier'


class Cloudinary {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    })
  }

  uploadBuffer(buffer) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'users/avatars' },
        (error, result) => error ? reject(error) : resolve(result)
      )

      streamifier.createReadStream(buffer).pipe(uploadStream)
    })
  }

  deleteImage(url = '') {
    const publicId = extractPublicId(url)
    if (!publicId) return
    return cloudinary.uploader.destroy(publicId)
  }

  async getImagesInFolder(folder, transform = '') {
    const result = await cloudinary.search.expression(`folder:${folder}`).execute()
    return result.resources.map((r) => r.secure_url.replace(`/v${r.version}`, `/${transform}/v${r.version}`))
  }
}

export default new Cloudinary()
