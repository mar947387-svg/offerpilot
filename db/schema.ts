import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  company: text("company").notNull(),
  role: text("role").notNull(),
  city: text("city").notNull().default(""),
  status: text("status").notNull().default("想投"),
  salary: text("salary").notNull().default(""),
  source: text("source").notNull().default(""),
  jd: text("jd").notNull().default(""),
  tags: text("tags").notNull().default("[]"),
  matchScore: integer("match_score").notNull().default(70),
  nextAction: text("next_action").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const interviews = sqliteTable("interviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobId: integer("job_id").references(() => jobs.id, { onDelete: "cascade" }),
  company: text("company").notNull().default(""),
  round: text("round").notNull().default("一面"),
  question: text("question").notNull(),
  answer: text("answer").notNull().default(""),
  reflection: text("reflection").notNull().default(""),
  result: text("result").notNull().default("待复盘"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
