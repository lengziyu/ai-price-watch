import { NextResponse } from "next/server";

import { extractArticleSourceFromUrl } from "@/lib/article-source-extractor";

export async function POST(request: Request) {
  try {
    const { url } = (await request.json()) as { url?: string };
    const sourceUrl = String(url ?? "").trim();

    if (!sourceUrl) {
      return NextResponse.json({ error: "请先输入来源链接。" }, { status: 400 });
    }

    const extracted = await extractArticleSourceFromUrl(sourceUrl);
    return NextResponse.json(extracted);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "抓取失败，请稍后重试。",
      },
      { status: 500 },
    );
  }
}
