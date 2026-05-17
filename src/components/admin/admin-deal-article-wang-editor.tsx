"use client";

import { useEffect, useMemo, useState } from "react";

import { Editor, Toolbar } from "@wangeditor-next/editor-for-react";
import type { IDomEditor, IEditorConfig, IToolbarConfig } from "@wangeditor-next/editor";

type EditorImageUploadResponse = {
  url?: string;
  error?: string;
};

type InsertImageFn = (url: string, alt: string, href: string) => void;

type AdminDealArticleWangEditorProps = {
  value: string;
  footerMessage: string;
  footerMeta: string;
  onChange: (value: string) => void;
  onStatusChange?: (message: string | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
};

async function uploadEditorImage(file: File) {
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

  return payload.url;
}

export function AdminDealArticleWangEditor({
  value,
  footerMessage,
  footerMeta,
  onChange,
  onStatusChange,
  onUploadingChange,
}: AdminDealArticleWangEditorProps) {
  const [editor, setEditor] = useState<IDomEditor | null>(null);

  useEffect(() => {
    return () => {
      if (!editor) {
        return;
      }

      editor.destroy();
    };
  }, [editor]);

  const toolbarConfig = useMemo<Partial<IToolbarConfig>>(
    () => ({
      modalAppendToBody: true,
      toolbarKeys: [
        "headerSelect",
        "|",
        "bold",
        "italic",
        "underline",
        "through",
        "color",
        "clearStyle",
        "|",
        "bulletedList",
        "numberedList",
        "blockquote",
        "code",
        "codeBlock",
        "|",
        "insertLink",
        "uploadImage",
        "|",
        "undo",
        "redo",
      ],
    }),
    [],
  );

  const editorConfig = useMemo<Partial<IEditorConfig>>(() => {
    const menuConfig: NonNullable<IEditorConfig["MENU_CONF"]> = {
      uploadImage: {
        maxFileSize: 6 * 1024 * 1024,
        allowedFileTypes: ["image/*"],
        async customUpload(file: File, insertFn: InsertImageFn) {
          onUploadingChange?.(true);
          onStatusChange?.("正文图片上传中...");

          try {
            const uploadedUrl = await uploadEditorImage(file);
            insertFn(uploadedUrl, file.name, "");
            onStatusChange?.("图片已插入正文。");
          } catch (error) {
            onStatusChange?.(
              error instanceof Error ? error.message : "图片上传失败，请稍后重试。",
            );
          } finally {
            onUploadingChange?.(false);
          }
        },
      },
      insertImage: {
        checkImage(src: string) {
          if (!src.trim()) {
            return "请输入图片地址。";
          }

          return true;
        },
      },
      editImage: {
        checkImage(src: string) {
          if (!src.trim()) {
            return "请输入图片地址。";
          }

          return true;
        },
      },
    };

    return {
      placeholder: "在这里编辑正文，支持标题、列表、引用、代码、链接和图片上传。",
      autoFocus: false,
      scroll: true,
      customAlert(info: string) {
        onStatusChange?.(info);
      },
      MENU_CONF: menuConfig,
    };
  }, [onStatusChange, onUploadingChange]);

  return (
    <div className="admin-rich-editor">
      <div className="admin-rich-editor__toolbar">
        <Toolbar
          editor={editor}
          defaultConfig={toolbarConfig}
          mode="default"
          className="admin-rich-editor__toolbar-inner"
        />
      </div>

      <div className="admin-rich-editor__content-shell">
        <Editor
          defaultConfig={editorConfig}
          value={value || "<p><br></p>"}
          onCreated={setEditor}
          onChange={(currentEditor) => onChange(currentEditor.getHtml())}
          mode="default"
          className="admin-rich-editor__editor"
          style={{ height: "100%" }}
        />
      </div>

      <div className="admin-rich-editor__footer">
        <span>{footerMessage}</span>
        <span>{footerMeta}</span>
      </div>
    </div>
  );
}
