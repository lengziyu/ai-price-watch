"use server";

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminSession,
  createAdminSession,
  getAdminSession,
  requireAdminAuth,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import {
  appendOperationLog,
  createManualDeal,
  type ManualDealInput,
} from "@/lib/admin-store";

const execFileAsync = promisify(execFile);

export type LoginActionState = {
  error?: string;
};

export type AdminMutationState = {
  status: "idle" | "success" | "error";
  message?: string;
  detail?: string;
  fieldErrors?: Record<string, string>;
};

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return {
      error: "请输入用户名和密码。",
    };
  }

  if (!verifyAdminCredentials(username, password)) {
    await appendOperationLog({
      actor: username || "anonymous",
      type: "login_failure",
      status: "failure",
      message: "后台登录失败",
      detail: "用户名或密码不正确。",
    });

    return {
      error: "用户名或密码错误。",
    };
  }

  await createAdminSession(username);
  await appendOperationLog({
    actor: username,
    type: "login_success",
    status: "success",
    message: "后台登录成功",
    detail: "已创建新的管理后台会话。",
  });
  redirect("/admin");
}

export async function logoutAction() {
  const session = await getAdminSession();
  await clearAdminSession();
  await appendOperationLog({
    actor: session?.username ?? "anonymous",
    type: "logout",
    status: "info",
    message: "后台退出登录",
    detail: "会话已清除。",
  });
  redirect("/admin/login");
}

export async function createManualDealAction(
  _prevState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  const session = await requireAdminAuth();
  const rawSuitableFor = String(formData.get("suitableFor") ?? "");

  const input: ManualDealInput = {
    title: String(formData.get("title") ?? "").trim(),
    provider: String(formData.get("provider") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    dealType: String(formData.get("dealType") ?? "other") as ManualDealInput["dealType"],
    value: String(formData.get("value") ?? "").trim() || undefined,
    deadline: String(formData.get("deadline") ?? "").trim() || undefined,
    sourceUrl: String(formData.get("sourceUrl") ?? "").trim(),
    howToGet: String(formData.get("howToGet") ?? "").trim(),
    suitableFor: rawSuitableFor
      .split(/[,\n/、，]/)
      .map((item) => item.trim())
      .filter(Boolean),
    riskLevel: String(formData.get("riskLevel") ?? "low") as ManualDealInput["riskLevel"],
    status: String(formData.get("status") ?? "active") as ManualDealInput["status"],
  };

  const fieldErrors: Record<string, string> = {};
  if (!input.title) fieldErrors.title = "请输入优惠标题";
  if (!input.provider) fieldErrors.provider = "请输入厂商名";
  if (!input.summary) fieldErrors.summary = "请输入摘要";
  if (!input.sourceUrl) fieldErrors.sourceUrl = "请输入来源链接";
  if (!input.howToGet) fieldErrors.howToGet = "请输入领取方式";
  if (input.suitableFor.length === 0) fieldErrors.suitableFor = "请至少填一个适合人群";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "表单信息还不完整。",
      fieldErrors,
    };
  }

  const created = await createManualDeal(input, session.username);
  revalidatePath("/admin");
  revalidatePath("/admin/manual");
  revalidatePath("/admin/content");
  revalidatePath("/admin/logs");

  return {
    status: "success",
    message: `已录入「${created.title}」`,
    detail: "这条数据已写入本地 JSON，可继续补录下一条。",
  };
}

export async function triggerCrawlAction(): Promise<AdminMutationState> {
  const session = await requireAdminAuth();

  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, ["scripts/crawl-data.mjs"], {
      cwd: process.cwd(),
      env: process.env,
      timeout: 120_000,
      maxBuffer: 4 * 1024 * 1024,
    });

    const detail = [stdout.trim(), stderr.trim()].filter(Boolean).join("\n") || "抓取脚本已执行完成。";

    await appendOperationLog({
      actor: session.username,
      type: "crawl_trigger",
      status: "success",
      message: "手动触发抓取完成",
      detail,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/jobs");
    revalidatePath("/admin/content");
    revalidatePath("/admin/logs");

    return {
      status: "success",
      message: "抓取已完成",
      detail,
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);

    await appendOperationLog({
      actor: session.username,
      type: "crawl_trigger",
      status: "failure",
      message: "手动触发抓取失败",
      detail,
    });

    return {
      status: "error",
      message: "抓取执行失败",
      detail,
    };
  }
}
