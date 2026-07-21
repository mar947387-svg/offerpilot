import { isAdminRequest } from "../admin-auth";

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "管理密码不正确" }, { status: 401 });
  }
  return Response.json({ ok: true });
}
