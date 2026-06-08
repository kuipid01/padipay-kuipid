import cloudinary from "./cloudinary";
import crypto from "crypto";
import { isTestSuite } from "../lib/suite";
import { mockCloudinaryUpload } from "../test-suite/external-mocks";

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder = "hubsell_uploads"
): Promise<string> => {
  if (isTestSuite()) {
    return mockCloudinaryUpload(folder).secureUrl;
  }

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
  if (isTestSuite()) {
    return {
      timestamp: Math.floor(Date.now() / 1000),
      signature: "mock-cloudinary-signature",
      apiKey: "mock-cloudinary-api-key",
      cloudName: "mock-suite",
      folder: `padi-loan/borrower-documents/${userId}`,
    };
  }

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
