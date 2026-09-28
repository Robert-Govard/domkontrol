import { NextResponse } from "next/server";
import { isStatus } from "@/lib/domain";
import { handleApiError } from "@/lib/http/responses";
import { listTickets } from "@/lib/repositories/tickets";

export const dynamic = "force-dynamic";

/** Список заявок (для интеграций/CRM). ?status=NEW */
export async function GET(req: Request) {
  try {
    const status = new URL(req.url).searchParams.get("status");
    const tickets = await listTickets({ status: isStatus(status) ? status : undefined });
    return NextResponse.json({ tickets });
  } catch (error) {
    return handleApiError(error);
  }
}
