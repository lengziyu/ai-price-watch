import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { importXArticleHtml } from "@/lib/x-html-import";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "请先登录后台。" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as { html?: unknown };
    const html = String(payload?.html ?? "").trim();

    if (!html) {
      return NextResponse.json({ error: "请先粘贴从 X 复制下来的 HTML。" }, { status: 400 });
    }

    const imported = await importXArticleHtml(html);

    return NextResponse.json({
      ...imported,
      notice:
        imported.skippedImageCount > 0
          ? `正文已导入，成功同步 ${imported.imageCount} 张图片，另有 ${imported.skippedImageCount} 张图片未能转存。`
          : `正文已导入，并同步了 ${imported.imageCount} 张图片。`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "X HTML 解析失败，请稍后重试。",
      },
      { status: 500 },
    );
  }
}
