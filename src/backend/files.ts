import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { ApiError } from "@/backend/http/errors";
import type { AttachmentRecord } from "@/models/db";
import { getMaxUploadBytes, getUploadRoot } from "@/backend/config/paths";

const ALLOWED_TYPES = new Map<string, string>([
  [".pdf", "application/pdf"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
]);

const STORED_NAME_PATTERN = /^[a-zA-Z0-9_-]+\.(pdf|jpg|jpeg|png)$/;

function normalizeMime(value: string): string {
  return value.split(";")[0].trim().toLowerCase();
}

function hasValidSignature(buffer: Buffer, extension: string): boolean {
  if (extension === ".pdf") {
    return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  }
  if (extension === ".jpg" || extension === ".jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (extension === ".png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return signature.every((byte, index) => buffer[index] === byte);
  }
  return false;
}

function maxMegabytes(): number {
  return Math.round((getMaxUploadBytes() / (1024 * 1024)) * 10) / 10;
}

function sanitizeDisplayName(name: string, extension: string): string {
  const base = path.basename(name || `synthetic-document${extension}`);
  const cleaned = base.replace(/[^\w.\- ()]/g, "_").slice(0, 120);
  return cleaned.length > 0 ? cleaned : `synthetic-document${extension}`;
}

function attachmentError(message: string): ApiError {
  return new ApiError(422, "invalid_attachment", message, { attachment: message });
}

export async function validateAndStoreAttachment(
  file: File,
  userId: string,
): Promise<AttachmentRecord> {
  if (file.size === 0) {
    throw attachmentError("The selected attachment is empty.");
  }

  const limit = getMaxUploadBytes();
  if (file.size > limit) {
    throw attachmentError(`Attachment must be ${maxMegabytes()} MB or smaller.`);
  }

  const extension = path.extname(file.name).toLowerCase();
  const expectedMime = ALLOWED_TYPES.get(extension);
  if (!expectedMime) {
    throw attachmentError("Only synthetic PDF, JPG, JPEG, or PNG samples are supported.");
  }

  const providedMime = normalizeMime(file.type);
  if (providedMime !== expectedMime) {
    throw attachmentError("The attachment type does not match its file extension.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > limit) {
    throw attachmentError(`Attachment must be ${maxMegabytes()} MB or smaller.`);
  }
  if (!hasValidSignature(buffer, extension)) {
    throw attachmentError("The attachment contents do not match a supported PDF or image file.");
  }

  const storedName = `${randomUUID()}${extension}`;
  const directory = path.join(getUploadRoot(), userId);
  const filePath = path.join(directory, storedName);

  try {
    await mkdir(directory, { recursive: true });
    await writeFile(filePath, buffer, { flag: "wx" });
  } catch (error) {
    console.error("[fincred-files] Failed to store attachment:", error);
    throw new ApiError(
      500,
      "attachment_storage_failed",
      "The synthetic attachment could not be stored. Please try again.",
    );
  }

  return {
    filename: sanitizeDisplayName(file.name, extension),
    storedName,
    mimeType: expectedMime,
    size: buffer.byteLength,
  };
}

export async function removeStoredAttachment(userId: string, storedName: string): Promise<void> {
  if (!STORED_NAME_PATTERN.test(storedName)) return;
  try {
    await unlink(path.join(getUploadRoot(), userId, storedName));
  } catch {
    // Cleanup is best-effort; the transaction failure is reported separately.
  }
}

export async function readStoredAttachment(
  userId: string,
  storedName: string,
): Promise<Buffer> {
  if (!STORED_NAME_PATTERN.test(storedName)) {
    throw new ApiError(404, "attachment_not_found", "Attachment not found.");
  }

  const root = path.resolve(getUploadRoot(), userId);
  const filePath = path.resolve(root, storedName);
  if (!filePath.startsWith(`${root}${path.sep}`)) {
    throw new ApiError(404, "attachment_not_found", "Attachment not found.");
  }

  try {
    return await readFile(filePath);
  } catch {
    throw new ApiError(404, "attachment_not_found", "Attachment not found.");
  }
}
