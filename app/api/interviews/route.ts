import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { interviews } from "../../../db/schema";
import { requireAdmin } from "../admin-auth";

function asText(value: unknown, fallback = "") { return typeof value === "string" ? value.trim() : fallback; }

export async function GET() {
  const rows = await getDb().select().from(interviews).orderBy(desc(interviews.createdAt), desc(interviews.id));
  return Response.json({ interviews: rows });
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const payload = await request.json() as Record<string, unknown>;
  const question = asText(payload.question);
  if (!question) return Response.json({ error: "面试问题必填" }, { status: 400 });
  const [interview] = await getDb().insert(interviews).values({
    company: asText(payload.company),
    round: asText(payload.round, "一面"),
    question,
    answer: asText(payload.answer),
    reflection: asText(payload.reflection),
    result: asText(payload.result, "待复盘"),
  }).returning();
  return Response.json({ interview }, { status: 201 });
}
