import cloudinary from "./cloudinary";

export const uploadToCloudinary = async (
  file: File,
  folder = "hubsell_uploads"
): Promise<string> => {
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) {
          return reject(new Error("Cloudinary upload failed"));
        }
        resolve(result.secure_url);
      }
    ).end(buffer);
  });
};
