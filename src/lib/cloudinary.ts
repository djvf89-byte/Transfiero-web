import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface ResultadoUpload {
  url: string
  cloudinaryId: string
}

export async function uploadImage(
  buffer: Buffer,
  folder: string
): Promise<ResultadoUpload> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `transfiero/${folder}`, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload fallido"))
        resolve({ url: result.secure_url, cloudinaryId: result.public_id })
      }
    )
    stream.end(buffer)
  })
}

export async function deleteImage(cloudinaryId: string): Promise<void> {
  await cloudinary.uploader.destroy(cloudinaryId)
}
