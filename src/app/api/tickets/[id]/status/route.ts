import { NextResponse } from "next/server";
import { z } from "zod";
import { STATUSES } from "@/lib/domain";
import { handleApiError } from "@/lib/http/responses";
import { changeTicketStatus } from "@/lib/services/ticket-service";

const bodySchema = z.object({ status: z.enum(STATUSES, { message: "Неизвестный статус" }) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = bodySchema.parse(await req.json());
    const result = await changeTicketStatus(id, status);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
