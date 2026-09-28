import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DomainError } from "@/lib/services/ticket-service";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Единообразный ответ на ошибку в API-роутах. */
export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError(error.issues[0]?.message ?? "Некорректные данные", 400);
  }
  if (error instanceof DomainError) {
    return jsonError(error.message, error.code === "NOT_FOUND" ? 404 : 409);
  }
  console.error("[api]", error);
  return jsonError("Внутренняя ошибка сервера", 500);
}
