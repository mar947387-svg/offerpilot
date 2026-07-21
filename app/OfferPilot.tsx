"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Job = {
  id: number;
  company: string;
  role: string;
  city: string;
  status: string;
  salary: string;
  source: string;
  jd: string;
  tags: string[];
  matchScore: number;
  nextAction: string;
  notes: string;
};

type Interview = {
  id: number;
  company: string;
  round: string;
  question: string;
  answer: string;
  reflection: string;
  result: string;
};

const statuses = ["想投", "已投", "笔试", "面试", "Offer", "挂了"];
const keywords = ["用户调研", "竞品分析", "需求分析", "数据分析", "SQL", "PRD", "用户增长", "内容社区", "本地生活", "搜索推荐", "转化率", "交易链路"];
const emptyJob = { company: "", role: "", city: "", status: "想投", salary: "", source: "", jd: "", tags: "", matchScore: 75, nextAction: "", notes: "" };
const emptyInterview = { company: "", round: "一面", question: "", answer: "", reflection: "", result: "待复盘" };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "请求失败");
  return data;
}

export default function OfferPilot() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [jobForm, setJobForm] = useState(emptyJob);
  const [interviewForm, setInterviewForm] = useState(emptyInterview);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [editingInterviewId, setEditingInterviewId] = useState<number | null>(null);
  const [activeStatus, setActiveStatus] = useState("全部");
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [selectedJd, setSelectedJd] = useState("");
  const [message, setMessage] = useState("正在加载数据...");
  const isAdmin = adminPassword.length > 0;

  async function load() {
    try {
      const [jobData, interviewData] = await Promise.all([api<{ jobs: Job[] }>("/api/jobs"), api<{ interviews: Interview[] }>("/api/interviews")]);
      setJobs(jobData.jobs);
      setInterviews(interviewData.interviews);
      setSelectedJd(jobData.jobs[0]?.jd ?? "");
      setMessage(jobData.jobs.length ? "数据已同步" : "暂无数据，请进入管理模式添加");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("offerpilot-admin-password") ?? "";
    if (saved) setAdminPassword(saved);
    load();
  }, []);

  const visibleJobs = activeStatus === "全部" ? jobs : jobs.filter((job) => job.status === activeStatus);
  const extractedKeywords = useMemo(() => {
    const text = selectedJd.toLowerCase();
    const found = keywords.filter((word) => text.includes(word.toLowerCase()));
    return found.length ? found : ["需求分析", "数据分析", "PRD"];
  }, [selectedJd]);
  const metrics = {
    total: jobs.length,
    interviews: jobs.filter((job) => job.status === "面试" || job.status === "Offer").length,
    offers: jobs.filter((job) => job.status === "Offer").length,
  };

  function adminHeaders() {
    return { "x-admin-password": adminPassword };
  }

  async function login(event: FormEvent) {
    event.preventDefault();
    await api("/api/admin", { method: "POST", headers: { "x-admin-password": passwordInput } });
    setAdminPassword(passwordInput);
    sessionStorage.setItem("offerpilot-admin-password", passwordInput);
    setPasswordInput("");
    setMessage("已进入管理模式");
  }

  async function saveJob(event: FormEvent) {
    event.preventDefault();
    const body = JSON.stringify(jobForm);
    if (editingJobId) await api(`/api/jobs/${editingJobId}`, { method: "PATCH", headers: adminHeaders(), body });
    else await api("/api/jobs", { method: "POST", headers: adminHeaders(), body });
    setJobForm(emptyJob);
    setEditingJobId(null);
    await load();
  }

  async function saveInterview(event: FormEvent) {
    event.preventDefault();
    const body = JSON.stringify(interviewForm);
    if (editingInterviewId) await api(`/api/interviews/${editingInterviewId}`, { method: "PATCH", headers: adminHeaders(), body });
    else await api("/api/interviews", { method: "POST", headers: adminHeaders(), body });
    setInterviewForm(emptyInterview);
    setEditingInterviewId(null);
    await load();
  }

  return (
    <main className="min-h-screen bg-[#f6f3ee] text-[#22201d]">
      <section className="border-b border-[#ded7cc] bg-[#fbfaf7] px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b5c38]">OfferPilot</p>
          <h1 className="mt-2 text-4xl font-semibold">产品实习投递与面试复盘助手</h1>
          <p className="mt-3 max-w-3xl text-sm text-[#6e665b]">公开只读展示，管理密码登录后可新增、编辑、删除岗位和面试复盘。</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Metric label="岗位总数" value={metrics.total} />
            <Metric label="面试机会" value={metrics.interviews} />
            <Metric label="Offer 数" value={metrics.offers} />
          </div>
          <p className="mt-4 rounded-md border border-[#ded7cc] bg-white px-4 py-3 text-sm">{message} · 当前模式：{isAdmin ? "管理可编辑" : "公开只读"}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <Panel title="投递看板">
            <div className="mb-4 flex flex-wrap gap-2">
              {["全部", ...statuses].map((status) => <button key={status} onClick={() => setActiveStatus(status)} className={`rounded-full border px-3 py-1 text-sm ${activeStatus === status ? "bg-[#22201d] text-white" : "bg-white"}`}>{status}</button>)}
            </div>
            <div className="grid gap-3">
              {visibleJobs.map((job) => <article className="rounded-lg border border-[#e8e1d7] bg-[#fffdf9] p-4" key={job.id}>
                <div className="flex justify-between gap-3">
                  <div><h3 className="font-semibold">{job.company}</h3><p>{job.role} · {job.city || "未填城市"} · {job.salary || "未填薪资"}</p></div>
                  <span className="rounded-full bg-[#e9f4ef] px-3 py-1 text-sm text-[#2f6f56]">{job.status}</span>
                </div>
                <p className="mt-3 text-sm text-[#625b52]">下一步：{job.nextAction || "待补充"}</p>
                <div className="mt-3 flex flex-wrap gap-2">{job.tags.map((tag) => <span className="rounded-md bg-[#f1ece4] px-2 py-1 text-xs" key={tag}>{tag}</span>)}</div>
                <button className="mt-3 rounded-md bg-[#9b5c38] px-3 py-2 text-sm text-white" onClick={() => setSelectedJd(job.jd)}>分析 JD</button>
                {isAdmin ? <button className="ml-2 rounded-md border px-3 py-2 text-sm" onClick={() => { setEditingJobId(job.id); setJobForm({ ...job, tags: job.tags.join("，") }); }}>编辑</button> : null}
              </article>)}
            </div>
          </Panel>

          <Panel title="面试题库与复盘">
            <div className="grid gap-3">{interviews.map((item) => <article className="rounded-lg border border-[#e8e1d7] bg-[#fffdf9] p-4" key={item.id}>
              <p className="text-sm font-semibold text-[#9b5c38]">{item.company || "未关联公司"} · {item.round} · {item.result}</p>
              <h3 className="mt-1 font-semibold">{item.question}</h3>
              <p className="mt-2 text-sm text-[#625b52]">回答：{item.answer || "未记录"}</p>
              <p className="mt-1 text-sm text-[#625b52]">复盘：{item.reflection || "未复盘"}</p>
              {isAdmin ? <button className="mt-3 rounded-md border px-3 py-2 text-sm" onClick={() => { setEditingInterviewId(item.id); setInterviewForm(item); }}>编辑</button> : null}
            </article>)}</div>
          </Panel>
        </div>

        <aside className="space-y-5">
          {!isAdmin ? <Panel title="管理入口"><form className="space-y-3" onSubmit={login}><input className="w-full rounded-md border px-3 py-2" type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="输入管理密码" /><button className="w-full rounded-md bg-[#22201d] px-4 py-2 text-white">进入管理模式</button></form></Panel> : null}
          {isAdmin ? <Panel title={editingJobId ? "编辑岗位" : "新增岗位"}><form className="space-y-3" onSubmit={saveJob}><Input label="公司" value={jobForm.company} onChange={(company) => setJobForm({ ...jobForm, company })} /><Input label="岗位" value={jobForm.role} onChange={(role) => setJobForm({ ...jobForm, role })} /><Input label="城市" value={jobForm.city} onChange={(city) => setJobForm({ ...jobForm, city })} /><Input label="标签" value={jobForm.tags} onChange={(tags) => setJobForm({ ...jobForm, tags })} /><textarea className="w-full rounded-md border px-3 py-2" value={jobForm.jd} onChange={(e) => setJobForm({ ...jobForm, jd: e.target.value })} placeholder="JD" /><button className="w-full rounded-md bg-[#9b5c38] px-4 py-2 text-white">保存岗位</button></form></Panel> : null}
          <Panel title="JD 分析器"><div className="flex flex-wrap gap-2">{extractedKeywords.map((word) => <span className="rounded-full bg-[#e9f4ef] px-3 py-1 text-sm" key={word}>{word}</span>)}</div></Panel>
          {isAdmin ? <Panel title={editingInterviewId ? "编辑面试复盘" : "新增面试问题"}><form className="space-y-3" onSubmit={saveInterview}><Input label="公司" value={interviewForm.company} onChange={(company) => setInterviewForm({ ...interviewForm, company })} /><Input label="问题" value={interviewForm.question} onChange={(question) => setInterviewForm({ ...interviewForm, question })} /><textarea className="w-full rounded-md border px-3 py-2" value={interviewForm.reflection} onChange={(e) => setInterviewForm({ ...interviewForm, reflection: e.target.value })} placeholder="复盘" /><button className="w-full rounded-md bg-[#22201d] px-4 py-2 text-white">保存复盘</button></form></Panel> : null}
        </aside>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border bg-white p-4"><p className="text-sm text-[#746d63]">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>;
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-lg border border-[#ded7cc] bg-white p-4"><h2 className="text-xl font-semibold">{title}</h2><div className="mt-4">{children}</div></section>;
}
function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-sm"><span className="font-semibold">{label}</span><input className="mt-1 w-full rounded-md border px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}
