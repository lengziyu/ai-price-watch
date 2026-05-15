import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

const uploadDir = path.join(process.cwd(), "data", "uploads", "deal-article-body");

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "请先登录后台。" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("image");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "请选择要上传的图片。" }, { status: 400 });
  }

  const supportedTypes = new Map<string, string>([
    ["image/jpeg", ".jpg"],
    ["image/png", ".png"],
    ["image/webp", ".webp"],
    ["image/avif", ".avif"],
    ["image/svg+xml", ".svg"],
  ]);
  const extension = supportedTypes.get(file.type);

  if (!extension) {
    return NextResponse.json(
      { error: "正文图片仅支持 JPG、PNG、WebP、AVIF 或 SVG。" },
      { status: 400 },
    );
  }

  const maxFileSize = 6 * 1024 * 1024;
  if (file.size > maxFileSize) {
    return NextResponse.json({ error: "正文图片不能超过 6MB。" }, { status: 400 });
  }

  await mkdir(uploadDir, { recursive: true });
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const filePath = path.join(uploadDir, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, bytes);

  return NextResponse.json({
    url: `/uploads/deal-article-body/${fileName}`,
  });
}
