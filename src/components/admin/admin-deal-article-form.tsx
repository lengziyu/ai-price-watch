"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useActionState, useMemo, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import {
  FileTextIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";

import { type AdminMutationState } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  defaultDealArticleCoverImageUrl,
  detectDealArticleSourcePlatform,
  extractPlainTextFromHtml,
} from "@/lib/deal-articles";
import type { DealArticle, DealArticleSourcePlatform, DifficultyLevel } from "@/types";

const initialState: AdminMutationState = {
  status: "idle",
};

const AdminDealArticleWangEditor = dynamic(
  () =>
    import("@/components/admin/admin-deal-article-wang-editor").then(
      (module) => module.AdminDealArticleWangEditor,
    ),
  {
    ssr: false,
  },
);

function FieldMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs text-destructive">{message}</p>;
}

type AdminDealArticleFormProps = {
  action: (
    prevState: AdminMutationState,
    formData: FormData,
  ) => Promise<AdminMutationState>;
  article?: DealArticle;
  existingTags?: string[];
  submitLabel: string;
  pendingLabel: string;
};

type SourceExtractResponse = {
  sourcePlatform: DealArticleSourcePlatform;
  title?: string;
  summary?: string;
  rawContent: string;
};

type CoverImageUploadResponse = {
  url?: string;
  error?: string;
};

type XHtmlImportResponse = {
  sourcePlatform: DealArticleSourcePlatform;
  title?: string;
  summary?: string;
  rawContent: string;
  suggestedCoverImageUrl?: string;
  imageCount?: number;
  skippedImageCount?: number;
  notice?: string;
  error?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function convertPlainTextToEditorHtml(value: string) {
  const normalized = value.replace(/\r\n?/g, "\n").trim();
  if (!normalized) {
    return "";
  }

  const blocks = normalized
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const lines = chunk.split("\n").map((line) => line.trim()).filter(Boolean);
      const isList = lines.length > 1 && lines.every((line) => /^[-*•]\s+/.test(line));

      if (isList) {
        const items = lines
          .map((line) => line.replace(/^[-*•]\s+/, "").trim())
          .map((line) => `<li>${escapeHtml(line)}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }

      return `<p>${lines.map((line) => escapeHtml(line)).join("<br>")}</p>`;
    });

  return blocks.join("");
}

function normalizeEditorSubmissionHtml(value: string) {
  return value
    .replace(/^<p><br><\/p>$/i, "")
    .replace(/<p><br><\/p>/gi, "")
    .replace(/<div><br><\/div>/gi, "")
    .replace(/\u00A0/g, " ")
    .trim();
}

function getImportedCoverNotice(imageCount: number, skippedImageCount: number) {
  if (imageCount <= 0) {
    return "正文已导入。";
  }

  if (skippedImageCount > 0) {
    return `正文已导入，成功同步 ${imageCount} 张图片，另有 ${skippedImageCount} 张图片未能转存。`;
  }

  return `正文已导入，并同步了 ${imageCount} 张图片。`;
}

export function AdminDealArticleForm({
  action,
  article,
  existingTags = [],
  submitLabel,
  pendingLabel,
}: AdminDealArticleFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [sourceUrl, setSourceUrl] = useState(article?.sourceUrl ?? "");
  const [sourcePlatform, setSourcePlatform] = useState<DealArticleSourcePlatform>(article?.sourcePlatform ?? detectDealArticleSourcePlatform(article?.sourceUrl));
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(article?.difficulty ?? "medium");
  const [title, setTitle] = useState(article?.title ?? "");
  const [summary, setSummary] = useState(article?.summary ?? "");
  const [titleEn, setTitleEn] = useState(article?.titleByLocale?.en ?? "");
  const [summaryEn, setSummaryEn] = useState(article?.summaryByLocale?.en ?? "");
  const [slugEn, setSlugEn] = useState(article?.slugByLocale?.en ?? "");
  const initialRawContent = article?.rawContent ?? "";
  const initialEditorValue = useMemo(() => {
    if (!initialRawContent.trim()) {
      return "";
    }

    return /<\/?[a-z][^>]*>/i.test(initialRawContent)
      ? initialRawContent
      : convertPlainTextToEditorHtml(initialRawContent);
  }, [initialRawContent]);
  const [editorHtml, setEditorHtml] = useState(initialEditorValue);
  const [rawContentEn, setRawContentEn] = useState(article?.rawContentByLocale?.en ?? "");
  const [tags, setTags] = useState<string[]>(article?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [isFetchingSource, setIsFetchingSource] = useState(false);
  const [sourceFetchMessage, setSourceFetchMessage] = useState<string | null>(null);
  const [isImportSheetOpen, setIsImportSheetOpen] = useState(false);
  const [xHtmlInput, setXHtmlInput] = useState("");
  const [xHtmlImportMessage, setXHtmlImportMessage] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingEditorImage, setIsUploadingEditorImage] = useState(false);
  const [isImportingXHtml, setIsImportingXHtml] = useState(false);
  const [editorMessage, setEditorMessage] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState(article?.coverImageUrl ?? "/default-deal-article-cover.svg");
  const [uploadedCoverImageUrl, setUploadedCoverImageUrl] = useState("");
  const [isUploadingCoverImage, setIsUploadingCoverImage] = useState(false);
  const [coverUploadMessage, setCoverUploadMessage] = useState<string | null>(null);
  const isCreateMode = !article;
  const submittedRawContent = normalizeEditorSubmissionHtml(editorHtml);
  const editorTextLength = extractPlainTextFromHtml(submittedRawContent).replace(/\s+/g, "").length;
  const editorFooterMessage =
    editorMessage ??
    "支持直接编辑正文、插入图片，也可以先导入 HTML 再微调。";

  const addTag = (value: string) => {
    const normalized = value.trim();
    if (!normalized) {
      return;
    }

    setTags((currentTags) => {
      if (currentTags.includes(normalized)) {
        return currentTags;
      }

      return [...currentTags, normalized];
    });
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((currentTags) => currentTags.filter((item) => item !== tag));
  };

  const editTag = (tag: string) => {
    removeTag(tag);
    setTagInput(tag);
  };

  const suggestedTags = existingTags.filter((tag) => !tags.includes(tag)).slice(0, 12);

  const handleSourceUrlChange = (value: string) => {
    setSourceUrl(value);
    setSourcePlatform(detectDealArticleSourcePlatform(value));
  };

  const handleFetchSource = async () => {
    const trimmedUrl = sourceUrl.trim();
    if (!trimmedUrl || isFetchingSource) {
      return;
    }

    setIsFetchingSource(true);
    setSourceFetchMessage(null);

    try {
      const response = await fetch("/api/article-source-extract", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      const payload = (await response.json()) as SourceExtractResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "抓取失败，请稍后重试。");
      }

      setSourcePlatform(payload.sourcePlatform);
      setEditorHtml(convertPlainTextToEditorHtml(payload.rawContent));
      if (payload.title && !title.trim()) {
        setTitle(payload.title);
      }
      if (payload.summary && !summary.trim()) {
        setSummary(payload.summary);
      }
      setSourceFetchMessage("已抓取到来源内容，正文已自动回填。标题和摘要仅在当前为空时自动补入。");
    } catch (error) {
      setSourceFetchMessage(error instanceof Error ? error.message : "抓取失败，请手动粘贴正文。");
    } finally {
      setIsFetchingSource(false);
    }
  };

  const handleCoverImageUpload = async (file?: File) => {
    if (!file || isUploadingCoverImage) {
      return;
    }

    setIsUploadingCoverImage(true);
    setCoverUploadMessage("封面图上传中...");

    try {
      const uploadFormData = new FormData();
      uploadFormData.set("coverImage", file);

      const response = await fetch("/api/admin/cover-images", {
        method: "POST",
        body: uploadFormData,
      });
      const payload = (await response.json()) as CoverImageUploadResponse;

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "封面图上传失败，请稍后重试。");
      }

      setCoverImageUrl(payload.url);
      setUploadedCoverImageUrl(payload.url);
      setCoverUploadMessage("封面图已上传，保存文章后生效。");
    } catch (error) {
      setUploadedCoverImageUrl("");
      setCoverUploadMessage(error instanceof Error ? error.message : "封面图上传失败，请稍后重试。");
    } finally {
      setIsUploadingCoverImage(false);
      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }
    }
  };

  const submitImportedArticle = () => {
    requestAnimationFrame(() => {
      formRef.current?.requestSubmit();
    });
  };

  async function handleImportXHtml(publishAfterImport = false) {
    const trimmedHtml = xHtmlInput.trim();
    if (!trimmedHtml || isImportingXHtml) {
      return;
    }

    setIsImportingXHtml(true);
    setXHtmlImportMessage(null);

    try {
      const response = await fetch("/api/admin/x-html-import", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ html: trimmedHtml }),
      });
      const payload = (await response.json()) as XHtmlImportResponse;

      if (!response.ok || !payload.rawContent) {
        throw new Error(payload.error || "HTML 解析失败，请稍后重试。");
      }

      const importedImageCount = payload.imageCount ?? 0;
      const skippedImageCount = payload.skippedImageCount ?? 0;
      const shouldAutoApplyCover =
        isCreateMode &&
        !!payload.suggestedCoverImageUrl &&
        (coverImageUrl === defaultDealArticleCoverImageUrl || !uploadedCoverImageUrl);

      flushSync(() => {
        setSourcePlatform(payload.sourcePlatform);
        setTitle(payload.title ?? "");
        setSummary(payload.summary ?? "");
        setEditorHtml(payload.rawContent);
        setEditorMessage(
          payload.notice ?? getImportedCoverNotice(importedImageCount, skippedImageCount),
        );
        setSourceFetchMessage("已根据你粘贴的 HTML 自动回填标题、摘要和正文。");
        if (shouldAutoApplyCover && payload.suggestedCoverImageUrl) {
          setCoverImageUrl(payload.suggestedCoverImageUrl);
          setUploadedCoverImageUrl(payload.suggestedCoverImageUrl);
          setCoverUploadMessage("已自动提取正文首图作为封面，你也可以继续手动替换。");
        }
        setIsImportSheetOpen(false);
        setXHtmlInput("");
      });

      if (publishAfterImport) {
        submitImportedArticle();
      }
    } catch (error) {
      setXHtmlImportMessage(
        error instanceof Error ? error.message : "HTML 解析失败，请稍后重试。",
      );
    } finally {
      setIsImportingXHtml(false);
    }
  }

  const importXHtmlModal =
    isImportSheetOpen && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[140] flex justify-end bg-black/35 p-3 supports-backdrop-filter:backdrop-blur-xs sm:p-5">
            <button
              type="button"
              aria-label="关闭导入 HTML 弹框"
              className="absolute inset-0 cursor-default"
              onClick={() => {
                if (!isImportingXHtml) {
                  setIsImportSheetOpen(false);
                  setXHtmlImportMessage(null);
                }
              }}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="import-x-html-title"
              className="relative z-[141] flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-[18px] border border-border/70 bg-popover text-popover-foreground shadow-[0_28px_120px_rgba(0,0,0,0.24)]"
            >
              <div className="border-b border-border/70 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid gap-1">
                    <h2 id="import-x-html-title" className="font-heading text-base font-medium text-foreground">
                      导入 HTML
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      把文章相关的 HTML 粘进来。系统会优先识别 X 长文结构；其他常见 HTML 也会按正文内容清洗导入，并尝试把图片转存到本站。
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0"
                    onClick={() => {
                      if (!isImportingXHtml) {
                        setIsImportSheetOpen(false);
                        setXHtmlImportMessage(null);
                      }
                    }}
                    disabled={isImportingXHtml}
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 overflow-y-auto px-5 py-4">
                <Textarea
                  value={xHtmlInput}
                  onChange={(event) => setXHtmlInput(event.target.value)}
                  className="min-h-[360px] rounded-[12px] font-mono text-[12px] leading-6"
                  placeholder='把要导入的 HTML 粘贴到这里，例如正文容器、文章详情 DOM，或包含 "public-DraftEditor-content" 的完整源码。'
                  disabled={isImportingXHtml}
                />
                <div className="rounded-[10px] border border-border bg-background/72 px-3 py-2 text-xs leading-6 text-muted-foreground">
                  导入后会自动覆盖当前标题、摘要和正文。
                  {isCreateMode ? " 新建文章时还会默认提取正文第一张图作为封面。" : " 封面图仍然保持当前设置。"}
                </div>
                {xHtmlImportMessage ? (
                  <div className="rounded-[10px] border border-destructive/25 bg-destructive/8 px-3 py-2 text-xs leading-6 text-destructive">
                    {xHtmlImportMessage}
                  </div>
                ) : null}
              </div>

              <div className="mt-auto flex flex-col gap-2 border-t border-border/70 px-5 py-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (!isImportingXHtml) {
                      setIsImportSheetOpen(false);
                      setXHtmlImportMessage(null);
                    }
                  }}
                  disabled={isImportingXHtml}
                  className="rounded-[10px]"
                >
                  取消
                </Button>
                <Button
                  type="button"
                  onClick={() => handleImportXHtml(false)}
                  disabled={!xHtmlInput.trim() || isImportingXHtml}
                  className="rounded-[10px]"
                >
                  {isImportingXHtml ? <LoaderCircleIcon className="animate-spin" /> : <SparklesIcon />}
                  {isImportingXHtml ? "解析并回填中..." : "确认导入并回填"}
                </Button>
                {isCreateMode ? (
                  <Button
                    type="button"
                    onClick={() => handleImportXHtml(true)}
                    disabled={!xHtmlInput.trim() || isImportingXHtml || pending}
                    className="rounded-[10px]"
                  >
                    {isImportingXHtml || pending ? <LoaderCircleIcon className="animate-spin" /> : <SparklesIcon />}
                    {isImportingXHtml || pending ? "导入并发布中..." : "导入并直接发布"}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <form ref={formRef} action={formAction} className="grid gap-5">
      <div className="grid gap-2">
        <label htmlFor="sourceUrl" className="text-sm font-medium text-foreground">
          来源链接
        </label>
        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto]">
          <Input
            id="sourceUrl"
            name="sourceUrl"
            value={sourceUrl}
            onChange={(event) => handleSourceUrlChange(event.target.value)}
            className="rounded-[8px]"
            placeholder="https://x.com/... 或 https://linux.do/..."
          />
          <Button type="button" variant="secondary" onClick={handleFetchSource} disabled={!sourceUrl.trim() || isFetchingSource} className="rounded-[8px] px-4">
            {isFetchingSource ? <LoaderCircleIcon className="animate-spin" /> : <SparklesIcon />}
            {isFetchingSource ? "抓取中..." : "抓取内容"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsImportSheetOpen(true)}
            className="rounded-[8px] px-4"
          >
            <FileTextIcon />
            导入 HTML
          </Button>
        </div>
        {sourceFetchMessage ? (
          <div className="rounded-[8px] border border-border bg-background/72 px-3 py-2 text-xs leading-6 text-muted-foreground">
            {sourceFetchMessage}
          </div>
        ) : null}
      </div>

      {importXHtmlModal}

      <input type="hidden" name="sourcePlatform" value={sourcePlatform} />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_500px]">
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="difficulty" className="text-sm font-medium text-foreground">
                难度
              </label>
              <select
                id="difficulty"
                name="difficulty"
                className="admin-form-select"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as DifficultyLevel)}
              >
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="advanced">较难</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium text-foreground">
                活动状态
              </label>
              <select
                id="status"
                name="status"
                className="admin-form-select"
                defaultValue={article?.status ?? "not_started"}
              >
                <option value="not_started">未开始</option>
                <option value="in_progress">进行中</option>
                <option value="ended">已结束</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">标签管理</label>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <Input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    addTag(tagInput);
                  }
                }}
                className="rounded-[8px]"
                placeholder="输入标签后回车"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => addTag(tagInput)}
                className="rounded-[8px] px-3"
              >
                <PlusIcon />
              </Button>
            </div>
            <input type="hidden" name="tags" value={tags.join(", ")} />
            <div className="flex min-h-10 flex-wrap gap-2 rounded-[8px] border border-border bg-background/72 px-3 py-2">
              {tags.length ? (
                tags.map((tag, index) => (
                  <Badge key={`${tag}-${index}`} variant="outline" className="rounded-[8px] px-2 py-1">
                    <span>{tag}</span>
                    <button type="button" onClick={() => editTag(tag)} className="ml-1 text-muted-foreground hover:text-foreground">
                      <PencilIcon className="size-3" />
                    </button>
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-muted-foreground hover:text-destructive">
                      <XIcon className="size-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">还没有标签，建议补几个关键词方便后面筛选。</span>
              )}
            </div>
            {suggestedTags.length ? (
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="inline-flex h-8 items-center rounded-full border border-border/85 bg-background/78 px-3 text-[12px] text-muted-foreground transition hover:border-primary/28 hover:bg-primary/6 hover:text-foreground"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium text-foreground">
              文章标题
            </label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded-[8px]"
              placeholder="可选，不填就从原文第一行自动提取"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="summary" className="text-sm font-medium text-foreground">
              摘要
            </label>
            <Textarea
              id="summary"
              name="summary"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              className="min-h-24 rounded-[8px]"
              placeholder="可选。不填时会自动取重排后的第一段作为摘要。"
            />
          </div>

          <div className="rounded-[8px] border border-border bg-background/56 p-3">
            <div className="mb-2 text-sm font-medium text-foreground">英文版本（可选）</div>
            <div className="grid gap-3">
              <div className="grid gap-2">
                <label htmlFor="titleEn" className="text-sm font-medium text-foreground">
                  英文标题
                </label>
                <Input
                  id="titleEn"
                  name="titleEn"
                  value={titleEn}
                  onChange={(event) => setTitleEn(event.target.value)}
                  className="rounded-[8px]"
                  placeholder="例如: Free $20 Kiro Pro Trial"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="summaryEn" className="text-sm font-medium text-foreground">
                  英文摘要
                </label>
                <Textarea
                  id="summaryEn"
                  name="summaryEn"
                  value={summaryEn}
                  onChange={(event) => setSummaryEn(event.target.value)}
                  className="min-h-20 rounded-[8px]"
                  placeholder="Optional English summary."
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="slugEn" className="text-sm font-medium text-foreground">
                  英文 slug（可选）
                </label>
                <Input
                  id="slugEn"
                  name="slugEn"
                  value={slugEn}
                  onChange={(event) => setSlugEn(event.target.value)}
                  className="rounded-[8px]"
                  placeholder="free-20-kiro-pro"
                />
                <div className="text-xs text-muted-foreground">
                  仅支持英文、数字和连字符；留空将根据英文标题自动生成。
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="text-sm font-medium text-foreground">当前封面</div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-[8px] border border-border bg-background/72">
              <Image
                src={coverImageUrl}
                alt={article?.title ? `${article.title} 当前封面` : "默认封面"}
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 520px"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="coverImage" className="text-sm font-medium text-foreground">
              上传封面图
            </label>
            <Input
              id="coverImage"
              ref={coverInputRef}
              name="coverImage"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
              className="rounded-[8px]"
              disabled={isUploadingCoverImage}
              onChange={(event) => handleCoverImageUpload(event.currentTarget.files?.[0])}
            />
            <input type="hidden" name="uploadedCoverImageUrl" value={uploadedCoverImageUrl} />
            <div className="text-xs leading-6 text-muted-foreground">
              建议使用简洁、信息量低的封面。不上传时会使用默认封面。支持 JPG、PNG、WebP、AVIF、SVG，文件大小不超过 6MB。
            </div>
            {coverUploadMessage ? (
              <div className="rounded-[8px] border border-border bg-background/72 px-3 py-2 text-xs leading-5 text-muted-foreground">
                {isUploadingCoverImage ? "封面图上传中..." : coverUploadMessage}
              </div>
            ) : null}
          </div>

          {article ? (
            <label className="flex items-start gap-3 rounded-[8px] border border-border bg-background/72 px-4 py-3 text-sm text-muted-foreground">
              <input type="checkbox" name="resetCoverImage" value="true" className="mt-0.5 size-4 rounded border-border" />
              <span>恢复为默认封面图</span>
            </label>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="rawContent" className="text-sm font-medium text-foreground">
          文章详情（富文本）
        </label>
        <AdminDealArticleWangEditor
          value={editorHtml}
          footerMessage={editorFooterMessage}
          footerMeta={`${editorTextLength} 字`}
          onChange={setEditorHtml}
          onStatusChange={setEditorMessage}
          onUploadingChange={setIsUploadingEditorImage}
        />
        <input type="hidden" id="rawContent" name="rawContent" value={submittedRawContent} />
        <FieldMessage message={state.fieldErrors?.rawContent} />
      </div>

      <div className="grid gap-2">
        <label htmlFor="rawContentEn" className="text-sm font-medium text-foreground">
          英文正文（可选）
        </label>
        <Textarea
          id="rawContentEn"
          name="rawContentEn"
          value={rawContentEn}
          onChange={(event) => setRawContentEn(event.target.value)}
          className="min-h-52 rounded-[8px]"
          placeholder="Paste or write English article body here. Supports plain text or sanitized HTML."
        />
        <div className="text-xs leading-6 text-muted-foreground">
          为空时前台英文页面会自动回退中文正文；填写后会优先展示英文内容。
        </div>
      </div>

      {state.message ? (
        <div
          className={
            state.status === "success"
              ? "rounded-[8px] border border-primary/20 bg-primary/8 px-3 py-2 text-sm text-foreground"
              : "rounded-[8px] border border-destructive/25 bg-destructive/8 px-3 py-2 text-sm text-destructive"
          }
        >
          <div>{state.message}</div>
          {state.detail ? <div className="mt-1 text-xs opacity-80">{state.detail}</div> : null}
        </div>
      ) : null}

      <div className="rounded-[8px] border border-border bg-background/72 px-4 py-3 text-[12px] leading-6 text-muted-foreground">
        当前版本支持从公开页面做基础抓取和重排：去掉多余空白、合并软换行、保留列表结构，并自动生成摘要、文章链接和封面回退逻辑。
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={pending || isUploadingCoverImage || isUploadingEditorImage}
          className="rounded-[8px]"
        >
          {pending || isUploadingCoverImage || isUploadingEditorImage ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
