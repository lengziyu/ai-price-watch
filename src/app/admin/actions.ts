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
  createDealArticle,
  deleteDealArticle,
  createManualDeal,
  createMembershipRateReview,
  createSourceReview,
  getCrawlSnapshot,
  getDealArticleById,
  type DealArticleInput,
  type ManualDealInput,
  type MembershipRateReviewInput,
  type SourceReviewInput,
  updateDealArticle,
} from "@/lib/admin-store";
import { membershipVendorBoards } from "@/data/membership-rates";

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
      message: "管理中心登录失败",
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
    message: "管理中心登录成功",
    detail: "已创建新的管理会话。",
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
    message: "退出管理中心",
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
    detail: "这条数据已保存到数据文件，可以继续录入下一条。",
  };
}

export async function createDealArticleAction(
  _prevState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  const session = await requireAdminAuth();
  const rawTags = String(formData.get("tags") ?? "");

  const input: DealArticleInput = {
    title: String(formData.get("title") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    rawContent: String(formData.get("rawContent") ?? "").trim(),
    coverImage: formData.get("coverImage") instanceof File ? (formData.get("coverImage") as File) : undefined,
    uploadedCoverImageUrl: String(formData.get("uploadedCoverImageUrl") ?? "").trim() || undefined,
    resetCoverImage: String(formData.get("resetCoverImage") ?? "") === "true",
    difficulty: String(formData.get("difficulty") ?? "medium") as DealArticleInput["difficulty"],
    sourcePlatform: String(formData.get("sourcePlatform") ?? "other") as DealArticleInput["sourcePlatform"],
    sourceUrl: String(formData.get("sourceUrl") ?? "").trim() || undefined,
    status: String(formData.get("status") ?? "not_started") as DealArticleInput["status"],
    tags: rawTags
      .split(/[,\n/、，]/)
      .map((item) => item.trim())
      .filter(Boolean),
  };

  const fieldErrors: Record<string, string> = {};
  if (!input.rawContent) fieldErrors.rawContent = "请粘贴要整理发布的原文";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "文章内容还不完整。",
      fieldErrors,
    };
  }

  let created: Awaited<ReturnType<typeof createDealArticle>>;

  try {
    created = await createDealArticle(input, session.username);
  } catch (error) {
    return {
      status: "error",
      message: "文章发布失败。",
      detail: error instanceof Error ? error.message : "请检查封面图和原文后重试。",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath("/admin/content");
  revalidatePath("/admin/logs");
  revalidatePath("/");
  revalidatePath("/deals");
  revalidatePath(`/deals/articles/${created.slug}`);
  redirect("/admin/articles");
}

export async function updateDealArticleAction(
  articleId: string,
  _prevState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  const session = await requireAdminAuth();
  const rawTags = String(formData.get("tags") ?? "");
  const currentArticle = await getDealArticleById(articleId);

  if (!currentArticle) {
    return {
      status: "error",
      message: "文章不存在或已被删除。",
    };
  }

  const input: DealArticleInput = {
    title: String(formData.get("title") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    rawContent: String(formData.get("rawContent") ?? "").trim(),
    coverImage: formData.get("coverImage") instanceof File ? (formData.get("coverImage") as File) : undefined,
    uploadedCoverImageUrl: String(formData.get("uploadedCoverImageUrl") ?? "").trim() || undefined,
    resetCoverImage: String(formData.get("resetCoverImage") ?? "") === "true",
    difficulty: String(formData.get("difficulty") ?? "medium") as DealArticleInput["difficulty"],
    sourcePlatform: String(formData.get("sourcePlatform") ?? "other") as DealArticleInput["sourcePlatform"],
    sourceUrl: String(formData.get("sourceUrl") ?? "").trim() || undefined,
    status: String(formData.get("status") ?? "not_started") as DealArticleInput["status"],
    tags: rawTags
      .split(/[,\n/、，]/)
      .map((item) => item.trim())
      .filter(Boolean),
  };

  const fieldErrors: Record<string, string> = {};
  if (!input.rawContent) fieldErrors.rawContent = "请粘贴要整理发布的原文";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "文章内容还不完整。",
      fieldErrors,
    };
  }

  let updated: Awaited<ReturnType<typeof updateDealArticle>>;

  try {
    updated = await updateDealArticle(articleId, input, session.username);
  } catch (error) {
    return {
      status: "error",
      message: "文章更新失败。",
      detail: error instanceof Error ? error.message : "请检查表单内容后重试。",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${articleId}/edit`);
  revalidatePath("/admin/content");
  revalidatePath("/admin/logs");
  revalidatePath("/");
  revalidatePath("/deals");
  revalidatePath(`/deals/articles/${currentArticle.slug}`);
  revalidatePath(`/deals/articles/${updated.slug}`);
  redirect("/admin/articles");
}

export async function deleteDealArticleAction(articleId: string) {
  const session = await requireAdminAuth();
  const currentArticle = await getDealArticleById(articleId);

  await deleteDealArticle(articleId, session.username);
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath("/admin/content");
  revalidatePath("/admin/logs");
  revalidatePath("/");
  revalidatePath("/deals");
  if (currentArticle) {
    revalidatePath(`/deals/articles/${currentArticle.slug}`);
  }
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

export async function createMembershipRateReviewAction(
  _prevState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  const session = await requireAdminAuth();
  const vendorId = String(formData.get("vendorId") ?? "").trim();
  const vendor = membershipVendorBoards.find((item) => item.id === vendorId);

  const input: MembershipRateReviewInput = {
    vendorId,
    vendorLabel: vendor?.label ?? "",
    planName: String(formData.get("planName") ?? "").trim(),
    priceSummary: String(formData.get("priceSummary") ?? "").trim(),
    regionScope: String(formData.get("regionScope") ?? "").trim() || undefined,
    sourceUrl: String(formData.get("sourceUrl") ?? "").trim(),
    evidenceUrl: String(formData.get("evidenceUrl") ?? "").trim() || undefined,
    captureMethod: String(formData.get("captureMethod") ?? "manual_review") as MembershipRateReviewInput["captureMethod"],
    reviewStatus: String(formData.get("reviewStatus") ?? "verified") as MembershipRateReviewInput["reviewStatus"],
    note: String(formData.get("note") ?? "").trim(),
  };

  const fieldErrors: Record<string, string> = {};
  if (!vendor) fieldErrors.vendorId = "请选择要维护的会员厂商";
  if (!input.planName) fieldErrors.planName = "请输入套餐名称";
  if (!input.priceSummary) fieldErrors.priceSummary = "请输入价格摘要";
  if (!input.sourceUrl) fieldErrors.sourceUrl = "请输入官方来源链接";
  if (!input.note) fieldErrors.note = "请补一段复核备注";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "会员速率信息还不完整。",
      fieldErrors,
    };
  }

  const created = await createMembershipRateReview(input, session.username);
  revalidatePath("/admin");
  revalidatePath("/admin/manual");
  revalidatePath("/admin/content");
  revalidatePath("/admin/logs");

  return {
    status: "success",
    message: `已补录「${created.vendorLabel} · ${created.planName}」`,
    detail: "这条会员速率复核已保存到数据文件，可以继续录入下一条。",
  };
}

export async function createSourceReviewAction(
  _prevState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  const session = await requireAdminAuth();
  const sourceId = String(formData.get("sourceId") ?? "").trim();
  const reviewStatus = String(formData.get("reviewStatus") ?? "verified") as SourceReviewInput["reviewStatus"];
  const note = String(formData.get("note") ?? "").trim();
  const snapshot = await getCrawlSnapshot();
  const source = snapshot.results.find((item) => item.id === sourceId);

  const fieldErrors: Record<string, string> = {};
  if (!source) fieldErrors.sourceId = "请选择要处理的复核源";
  if (!note) fieldErrors.note = "请写清楚处理结论，方便后续追踪";

  if (Object.keys(fieldErrors).length > 0 || !source) {
    return {
      status: "error",
      message: "复核处理信息还不完整。",
      fieldErrors,
    };
  }

  const created = await createSourceReview(
    {
      sourceId: source.id,
      vendor: source.vendor,
      category: source.category,
      title: source.title || source.sourceLabel || source.vendor,
      sourceUrl: source.url,
      resultStatus: source.ok ? "ok" : "failed",
      reviewStatus,
      note,
    },
    session.username,
  );

  revalidatePath("/admin");
  revalidatePath("/admin/review");
  revalidatePath("/admin/content");
  revalidatePath("/admin/logs");

  return {
    status: "success",
    message: `已处理「${created.vendor}」`,
    detail: "复核结论已写入来源复核记录，队列会按最新状态重新收敛。",
  };
}
