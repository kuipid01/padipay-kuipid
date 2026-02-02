import { v2 as cloudinary } from "cloudinary";

/**
 * Parse CLOUDINARY_URL exactly like cloudinary-go does
 * Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
 */
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (!cloudinaryUrl) {
  throw new Error("CLOUDINARY_URL is missing from environment variables");
}

const match = cloudinaryUrl.match(
  /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/
);

if (!match) {
  throw new Error("Invalid CLOUDINARY_URL format");
}

const [, apiKey, apiSecret, cloudName] = match;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});



export {v2 as default} from "cloudinary";