import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { jobs } from "../../../db/schema";
import { requireAdmin } from "../admin-auth";

const statuses = new Set(["想投", "已投", "笔试", "面试", "Offer", "挂了"]);

function parseTags(tags: unknown) {
  if (Array.isArray(tags)) return JSON.stringify(tags.map(String).map((tag) => tag.trim()).filter(Boolean));
  if (typeof tags === "string") return JSON.stringify(tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean));
  return "[]";
}
function asText(value: unknown, fallback = "") { return typeof value === "string" ? value.trim() : fallback; }
function asScore(value: unknown) { const score = Number(value); return Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : 70; }

export async function GET() {
  const rows = await getDb().select().from(jobs).orderBy(desc(jobs.updatedAt), desc(jobs.id));
  return Response.json({ jobs: rows.map((job) => ({ ...job, tags: JSON.parse(job.tags || "[]") })) });
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const payload = await request.json() as Record<string, unknown>;
  const company = asText(payload.company);
  const role = asText(payload.role);
  const status = asText(payload.status, "想投");
  if (!company || !role) return Response.json({ error: "公司和岗位名称必填" }, { status: 400 });
  const [job] = await getDb().insert(jobs).values({
    company,
    role,
    city: asText(payload.city),
    status: statuses.has(status) ? status : "想投",
    salary: asText(payload.salary),
    source: asText(payload.source),
    jd: asText(payload.jd),
    tags: parseTags(payload.tags),
    matchScore: asScore(payload.matchScore),
    nextAction: asText(payload.nextAction),
    notes: asText(payload.notes),
  }).returning();
  return Response.json({ job: { ...job, tags: JSON.parse(job.tags || "[]") } }, { status: 201 });
}
