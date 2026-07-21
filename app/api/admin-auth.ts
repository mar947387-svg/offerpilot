import { env } from "cloudflare:workers";

function getAdminPassword() {
  return (env as { OFFERPILOT_ADMIN_PASSWORD?: string }).OFFERPILOT_ADMIN_PASSWORD ?? "";
}

export function isAdminRequest(request: Request) {
  const configuredPassword = getAdminPassword();
  const providedPassword = request.headers.get("x-admin-password") ?? "";
  return configuredPassword.length > 0 && providedPassword === configuredPassword;
}

export function requireAdmin(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "需要管理密码才能编辑数据" }, { status: 401 });
  }
  return null;
}
