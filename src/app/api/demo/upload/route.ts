import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { handleApiError, jsonError } from "@/lib/http/responses";
import { isAllowedImage, MAX_UPLOAD_BYTES, saveUpload } from "@/lib/uploads";

export async function POST(req: Request) {
  if (!config.demoMode) return jsonError("Демо-режим выключен", 403);
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError("Файл не передан", 400);
    if (!isAllowedImage(file.type)) return jsonError("Поддерживаются JPG, PNG, WEBP и GIF", 415);
    if (file.size > MAX_UPLOAD_BYTES) return jsonError("Файл больше 5 МБ", 413);
    const url = await saveUpload(file);
    return NextResponse.json({ url });
  } catch (error) {
    return handleApiError(error);
  }
}
