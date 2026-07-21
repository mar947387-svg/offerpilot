import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { interviews } from "../../../../db/schema";
import { requireAdmin } from "../../admin-auth";

function asText(value: unknown, fallback = "") { return typeof value === "string" ? value.trim() : fallback; }
function readId(params: { id: string }) { return Number(params.id); }

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const params = await context.params;
  const payload = await request.json() as Record<string, unknown>;
  const [interview] = await getDb().update(interviews).set({
    company: asText(payload.company),
    round: asText(payload.round, "一面"),
    question: asText(payload.question),
    answer: asText(payload.answer),
    reflection: asText(payload.reflection),
    result: asText(payload.result, "待复盘"),
  }).where(eq(interviews.id, readId(params))).returning();
  return Response.json({ interview });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const params = await context.params;
  await getDb().delete(interviews).where(eq(interviews.id, readId(params)));
  return Response.json({ ok: true });
}
