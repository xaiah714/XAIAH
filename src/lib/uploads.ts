import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/**
 * Dev-only local disk storage. Swap for S3/Cloudinary in production —
 * the container filesystem is ephemeral.
 */
export async function saveUploadedPhoto(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Only JPEG, PNG, WEBP, or GIF images are allowed");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be under 8MB");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `/uploads/${filename}`;
}
