import { getDb } from "../../../db";
import { interviews, jobs } from "../../../db/schema";
import { requireAdmin } from "../admin-auth";

const demoJobs = [
  { company: "小红书", role: "产品运营实习生", city: "上海", status: "面试", salary: "180/天", source: "内推", jd: "负责内容社区的用户需求分析、内容供给效率优化、数据分析和活动策略。", tags: JSON.stringify(["内容社区", "用户增长", "数据分析"]), matchScore: 88, nextAction: "准备内容生态与留存问题", notes: "适合讲探店和内容消费场景。" },
  { company: "美团", role: "到店产品实习生", city: "长沙", status: "笔试", salary: "150/天", source: "官网", jd: "关注本地生活交易链路、转化率、商户供给和用户体验优化。", tags: JSON.stringify(["本地生活", "交易链路", "体验优化"]), matchScore: 84, nextAction: "复习漏斗分析和交易链路", notes: "和探店干饭兴趣强相关。" }
];

const demoInterviews = [
  { company: "小红书", round: "一面", question: "你如何判断一个需求值不值得做？", answer: "先讲用户场景，再讲数据验证，最后讲成本收益和优先级。", reflection: "需要补一个真实项目案例，避免只说方法论。", result: "待复盘" }
];

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const db = getDb();
  const existing = await db.select().from(jobs).limit(1);
  if (existing.length === 0) {
    await db.insert(jobs).values(demoJobs);
    await db.insert(interviews).values(demoInterviews);
  }
  return Response.json({ ok: true });
}
