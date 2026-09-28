import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/** Фото хранятся вне public/, т. к. next start не отдаёт файлы, добавленные после сборки. */
export const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const EXT_MIME = Object.fromEntries(Object.entries(MIME_EXT).map(([m, e]) => [e, m]));

export function isAllowedImage(mime: string): boolean {
  return mime in MIME_EXT;
}

export async function saveUpload(file: File): Promise<string> {
  const ext = MIME_EXT[file.type];
  if (!ext) throw new Error("Unsupported image type");
  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/api/uploads/${name}`;
}

const SAFE_NAME = /^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/;

export async function readUpload(name: string): Promise<{ data: Buffer; mime: string } | null> {
  if (!SAFE_NAME.test(name)) return null;
  try {
    const data = await readFile(path.join(UPLOAD_DIR, name));
    const ext = name.split(".").pop() ?? "";
    return { data, mime: EXT_MIME[ext] ?? "application/octet-stream" };
  } catch {
    return null;
  }
}
