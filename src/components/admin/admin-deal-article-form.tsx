"use client";

import Image from "next/image";
import { useActionState, useMemo, useRef, useState } from "react";
import {
  BoldIcon,
  Heading2Icon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  LoaderCircleIcon,
  PencilIcon,
  PilcrowIcon,
  PlusIcon,
  QuoteIcon,
  SparklesIcon,
  UnderlineIcon,
  XIcon,
} from "lucide-react";

import { type AdminMutationState } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  detectDealArticleSourcePlatform,
  formatDealArticleSourcePlatform,
} from "@/lib/deal-articles";
import type { DealArticle, DealArticleSourcePlatform } from "@/types";

const initialState: AdminMutationState = {
  status: "idle",
};

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

type EditorImageUploadResponse = {
  url?: string;
  error?: string;
};

const editorTextColors = [
  { label: "默认", value: "" },
  { label: "墨绿", value: "#063f33" },
  { label: "强调绿", value: "#059669" },
  { label: "橙色", value: "#ea580c" },
  { label: "红色", value: "#dc2626" },
  { label: "蓝色", value: "#2563eb" },
];

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

function normalizeEditorHtml(value: string) {
  return value
    .replace(/<p><br><\/p>/gi, "")
    .replace(/<div><br><\/div>/gi, "")
    .replace(/\u00A0/g, " ")
    .trim();
}

export function AdminDealArticleForm({
  action,
  article,
  existingTags = [],
  submitLabel,
  pendingLabel,
}: AdminDealArticleFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const editorRef = useRef<HTMLDivElement>(null);
  const [sourceUrl, setSourceUrl] = useState(article?.sourceUrl ?? "");
  const [sourcePlatform, setSourcePlatform] = useState<DealArticleSourcePlatform>(article?.sourcePlatform ?? detectDealArticleSourcePlatform(article?.sourceUrl));
  const [title, setTitle] = useState(article?.title ?? "");
  const [summary, setSummary] = useState(article?.summary ?? "");
  const initialRawContent = article?.rawContent ?? "";
  const initialEditorValue = useMemo(() => {
    if (!initialRawContent.trim()) {
      return "";
    }

    return /<\/?[a-z][^>]*>/i.test(initialRawContent)
      ? initialRawContent
      : convertPlainTextToEditorHtml(initialRawContent);
  }, [initialRawContent]);
  const [rawContent, setRawContent] = useState(initialEditorValue);
  const [tags, setTags] = useState<string[]>(article?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [isFetchingSource, setIsFetchingSource] = useState(false);
  const [sourceFetchMessage, setSourceFetchMessage] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const [isUploadingEditorImage, setIsUploadingEditorImage] = useState(false);
  const [editorMessage, setEditorMessage] = useState<string | null>(null);

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
      setRawContent(convertPlainTextToEditorHtml(payload.rawContent));
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

  const syncEditorContent = () => {
    setRawContent(normalizeEditorHtml(editorRef.current?.innerHTML ?? ""));
  };

  const saveEditorSelection = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !editorRef.current) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (editorRef.current.contains(range.commonAncestorContainer)) {
      savedSelectionRef.current = range.cloneRange();
    }
  };

  const restoreEditorSelection = () => {
    const selection = window.getSelection();
    const range = savedSelectionRef.current;

    editorRef.current?.focus();
    if (!selection || !range) {
      return;
    }

    selection.removeAllRanges();
    selection.addRange(range);
  };

  const applyEditorCommand = (command: "bold" | "italic" | "underline" | "insertUnorderedList" | "insertOrderedList" | "formatBlock") => {
    restoreEditorSelection();
    editorRef.current?.focus();
    if (command === "formatBlock") {
      document.execCommand("formatBlock", false, "p");
      syncEditorContent();
      return;
    }
    document.execCommand(command, false);
    syncEditorContent();
  };

  const applyHeading = () => {
    restoreEditorSelection();
    document.execCommand("formatBlock", false, "h2");
    syncEditorContent();
  };

  const applyBlockquote = () => {
    restoreEditorSelection();
    document.execCommand("formatBlock", false, "blockquote");
    syncEditorContent();
  };

  const applyTextColor = (color: string) => {
    restoreEditorSelection();
    if (color) {
      document.execCommand("foreColor", false, color);
    } else {
      document.execCommand("removeFormat", false);
    }
    syncEditorContent();
  };

  const insertLink = () => {
    restoreEditorSelection();
    const link = window.prompt("请输入链接（https://...）");
    if (!link) {
      return;
    }

    const normalized = link.trim();
    if (!/^https?:\/\//i.test(normalized) && !/^mailto:|^tel:/i.test(normalized)) {
      return;
    }

    document.execCommand("createLink", false, normalized);
    syncEditorContent();
  };

  const openEditorImagePicker = () => {
    saveEditorSelection();
    imageInputRef.current?.click();
  };

  const handleEditorImageUpload = async (file?: File) => {
    if (!file || isUploadingEditorImage) {
      return;
    }

    setIsUploadingEditorImage(true);
    setEditorMessage(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.set("image", file);

      const response = await fetch("/api/admin/editor-images", {
        method: "POST",
        body: uploadFormData,
      });
      const payload = (await response.json()) as EditorImageUploadResponse;

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "图片上传失败，请稍后重试。");
      }

      restoreEditorSelection();
      document.execCommand("insertImage", false, payload.url);
      syncEditorContent();
      setEditorMessage("图片已插入正文。");
    } catch (error) {
      setEditorMessage(error instanceof Error ? error.message : "图片上传失败，请稍后重试。");
    } finally {
      setIsUploadingEditorImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  return (
    <form action={formAction} encType="multipart/form-data" className="grid gap-5">
      <div className="grid gap-2">
        <label htmlFor="sourceUrl" className="text-sm font-medium text-foreground">
          来源链接
        </label>
        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
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
        </div>
        {sourceFetchMessage ? (
          <div className="rounded-[8px] border border-border bg-background/72 px-3 py-2 text-xs leading-6 text-muted-foreground">
            {sourceFetchMessage}
          </div>
        ) : null}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_500px]">
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="sourcePlatform" className="text-sm font-medium text-foreground">
                来源平台
              </label>
              <select
                id="sourcePlatform"
                name="sourcePlatform"
                className="admin-form-select"
                value={sourcePlatform}
                onChange={(event) => setSourcePlatform(event.target.value as DealArticleSourcePlatform)}
              >
                <option value="x">X</option>
                <option value="linux_do">Linux.do</option>
                <option value="other">其他</option>
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

          <div className="text-xs text-muted-foreground">当前会根据来源链接自动识别来源平台，也可以手动调整。</div>

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
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="text-sm font-medium text-foreground">当前封面</div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-[8px] border border-border bg-background/72">
              <Image
                src={article?.coverImageUrl ?? "/default-deal-article-cover.svg"}
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
            <Input id="coverImage" name="coverImage" type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml" className="rounded-[8px]" />
            <div className="text-xs leading-6 text-muted-foreground">
              建议使用简洁、信息量低的封面。不上传时会使用默认封面。支持 JPG、PNG、WebP、AVIF、SVG，文件大小不超过 6MB。
            </div>
          </div>

          {article ? (
            <label className="flex items-start gap-3 rounded-[8px] border border-border bg-background/72 px-4 py-3 text-sm text-muted-foreground">
              <input type="checkbox" name="resetCoverImage" value="true" className="mt-0.5 size-4 rounded border-border" />
              <span>保存时恢复默认封面图。如果同时上传了新图片，会优先使用新图片。</span>
            </label>
          ) : null}

          <div className="rounded-[8px] border border-border bg-background/72 px-4 py-3 text-sm text-muted-foreground">
            自动识别平台：{formatDealArticleSourcePlatform(sourcePlatform)}
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="rawContent" className="text-sm font-medium text-foreground">
          文章详情（富文本）
        </label>
        <div className="admin-rich-editor">
          <div className="admin-rich-editor__toolbar">
            <button type="button" className="admin-rich-editor__tool" onMouseDown={saveEditorSelection} onClick={() => applyEditorCommand("formatBlock")} title="正文段落">
              <PilcrowIcon className="size-4" />
            </button>
            <button type="button" className="admin-rich-editor__tool" onMouseDown={saveEditorSelection} onClick={applyHeading} title="二级标题">
              <Heading2Icon className="size-4" />
            </button>
            <button type="button" className="admin-rich-editor__tool" onMouseDown={saveEditorSelection} onClick={() => applyEditorCommand("bold")} title="加粗">
              <BoldIcon className="size-4" />
            </button>
            <button type="button" className="admin-rich-editor__tool" onMouseDown={saveEditorSelection} onClick={() => applyEditorCommand("italic")} title="斜体">
              <ItalicIcon className="size-4" />
            </button>
            <button type="button" className="admin-rich-editor__tool" onMouseDown={saveEditorSelection} onClick={() => applyEditorCommand("underline")} title="下划线">
              <UnderlineIcon className="size-4" />
            </button>
            <button type="button" className="admin-rich-editor__tool" onMouseDown={saveEditorSelection} onClick={() => applyEditorCommand("insertUnorderedList")} title="无序列表">
              <ListIcon className="size-4" />
            </button>
            <button type="button" className="admin-rich-editor__tool" onMouseDown={saveEditorSelection} onClick={() => applyEditorCommand("insertOrderedList")} title="有序列表">
              <ListOrderedIcon className="size-4" />
            </button>
            <button type="button" className="admin-rich-editor__tool" onMouseDown={saveEditorSelection} onClick={applyBlockquote} title="引用">
              <QuoteIcon className="size-4" />
            </button>
            <button type="button" className="admin-rich-editor__tool" onMouseDown={saveEditorSelection} onClick={insertLink} title="插入链接">
              <LinkIcon className="size-4" />
            </button>
            <button type="button" className="admin-rich-editor__tool" onMouseDown={saveEditorSelection} onClick={openEditorImagePicker} title="上传并插入图片" disabled={isUploadingEditorImage}>
              {isUploadingEditorImage ? <LoaderCircleIcon className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
            </button>
            <div className="admin-rich-editor__colors" aria-label="文字颜色">
              {editorTextColors.map((color) => (
                <button
                  key={color.label}
                  type="button"
                  className="admin-rich-editor__color"
                  title={`文字颜色：${color.label}`}
                  onMouseDown={saveEditorSelection}
                  onClick={() => applyTextColor(color.value)}
                  style={{ ["--editor-color" as string]: color.value || "var(--foreground)" }}
                >
                  <span />
                </button>
              ))}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
              className="hidden"
              onChange={(event) => handleEditorImageUpload(event.currentTarget.files?.[0])}
            />
          </div>
          <div
            ref={editorRef}
            className="admin-rich-editor__content"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-label="文章详情富文本编辑器"
            onMouseUp={saveEditorSelection}
            onKeyUp={saveEditorSelection}
            onInput={(event) => {
              const content = normalizeEditorHtml(event.currentTarget.innerHTML);
              setRawContent(content);
            }}
            dangerouslySetInnerHTML={{
              __html: rawContent || "<p></p>",
            }}
          />
          <input type="hidden" id="rawContent" name="rawContent" value={rawContent} />
        </div>
        {editorMessage ? (
          <div className="rounded-[8px] border border-border bg-background/72 px-3 py-2 text-xs leading-5 text-muted-foreground">
            {editorMessage}
          </div>
        ) : null}
        <FieldMessage message={state.fieldErrors?.rawContent} />
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
        <Button type="submit" disabled={pending} className="rounded-[8px]">
          {pending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
