import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";

export const runtime = "nodejs";

const uploadDir = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  "data",
  "uploads",
  "deal-articles",
);

const contentTypes = new Map<string, string>([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".avif", "image/avif"],
  [".svg", "image/svg+xml"],
]);

function normalizeFileName(fileName: string) {
  if (!/^[A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp|avif|svg)$/i.test(fileName)) {
    return null;
  }

  return fileName;
}

async function readCoverImage(fileName: string) {
  const normalizedFileName = normalizeFileName(fileName);
  if (!normalizedFileName) {
    return null;
  }

  const extension = path.extname(normalizedFileName).toLowerCase();
  const contentType = contentTypes.get(extension);
  if (!contentType) {
    return null;
  }

  try {
    const file = await readFile(path.join(uploadDir, normalizedFileName));
    return { contentType, file };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  return null;
}

function buildHeaders(contentType: string, contentLength?: number) {
  const headers = new Headers({
    "Cache-Control": "public, max-age=0, must-revalidate",
    "Content-Type": contentType,
  });

  if (typeof contentLength === "number") {
    headers.set("Content-Length", String(contentLength));
  }

  return headers;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileName: string }> },
) {
  const { fileName } = await params;
  const image = await readCoverImage(fileName);

  if (!image) {
    notFound();
  }

  return new Response(new Uint8Array(image.file), {
    headers: buildHeaders(image.contentType, image.file.byteLength),
  });
}

export async function HEAD(
  _request: Request,
  { params }: { params: Promise<{ fileName: string }> },
) {
  const { fileName } = await params;
  const image = await readCoverImage(fileName);

  if (!image) {
    notFound();
  }

  return new Response(null, {
    headers: buildHeaders(image.contentType, image.file.byteLength),
  });
}
