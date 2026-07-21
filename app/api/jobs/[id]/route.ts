import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { jobs } from "../../../../db/schema";
import { requireAdmin } from "../../admin-auth";

function parseTags(tags: unknown) {
  if (Array.isArray(tags)) return JSON.stringify(tags.map(String).map((tag) => tag.trim()).filter(Boolean));
  if (typeof tags === "string") return JSON.stringify(tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean));
  return "[]";
}
function asText(value: unknown, fallback = "") { return typeof value === "string" ? value.trim() : fallback; }
function asScore(value: unknown) { const score = Number(value); return Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : 70; }
function readId(params: { id: string }) { return Number(params.id); }

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const params = await context.params;
  const payload = await request.json() as Record<string, unknown>;
  const [job] = await getDb().update(jobs).set({
    company: asText(payload.company),
    role: asText(payload.role),
    city: asText(payload.city),
    status: asText(payload.status, "想投"),
    salary: asText(payload.salary),
    source: asText(payload.source),
    jd: asText(payload.jd),
    tags: parseTags(payload.tags),
    matchScore: asScore(payload.matchScore),
    nextAction: asText(payload.nextAction),
    notes: asText(payload.notes),
    updatedAt: sql`CURRENT_TIMESTAMP`,
  }).where(eq(jobs.id, readId(params))).returning();
  return Response.json({ job: { ...job, tags: JSON.parse(job.tags || "[]") } });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const params = await context.params;
  await getDb().delete(jobs).where(eq(jobs.id, readId(params)));
  return Response.json({ ok: true });
}
