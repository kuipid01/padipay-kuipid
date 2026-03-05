import cloudinary from "./cloudinary";
import crypto from "crypto";

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder = "hubsell_uploads"
): Promise<string> => {

  return new Promise((resolve, reject) => {

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {

        if (error) {
          console.error("Cloudinary error:", error);
          return reject(error);
        }

        if (!result?.secure_url) {
          return reject(new Error("Cloudinary upload failed"));
        }

        resolve(result.secure_url);
      }
    );

    stream.end(buffer);

  });
};



export async function generateUploadSignature(userId: string) {
  const timestamp = Math.floor(Date.now() / 1000);

  const params = {
    folder: `padi-loan/borrower-documents/${userId}`,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder: params.folder,
  };
}