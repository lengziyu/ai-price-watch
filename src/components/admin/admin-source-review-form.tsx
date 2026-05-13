"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";

import { createSourceReviewAction, type AdminMutationState } from "@/app/admin/actions";
import { renderSourceReviewStatusLabel } from "@/lib/admin-utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type QueueItem = {
  id: string;
  vendor: string;
  item: string;
  type: string;
  status: string;
  reason: string;
  sourceUrl: string;
};

const initialState: AdminMutationState = {
  status: "idle",
};

const reviewStatuses = ["verified", "needs_update", "blocked", "ignored"] as const;

function FieldMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs text-destructive">{message}</p>;
}

function buildDefaultNote(item?: QueueItem) {
  if (!item) {
    return "";
  }

  if (item.status === "失败") {
    return `${item.vendor} 当前公开抓取失败：${item.reason}。先标记来源状态，后续可改走人工复核或浏览器辅助。`;
  }

  return `${item.vendor} 已抓到价格/计划信号：${item.reason}。请确认口径是否可发布。`;
}

export function AdminSourceReviewForm({ queue }: { queue: QueueItem[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedSourceId, setSelectedSourceId] = useState(queue[0]?.id ?? "");
  const [state, formAction, pending] = useActionState(createSourceReviewAction, initialState);
  const selectedItem = useMemo(
    () => queue.find((item) => item.id === selectedSourceId),
    [queue, selectedSourceId],
  );
  const defaultReviewStatus = selectedItem?.status === "失败" ? "blocked" : "verified";

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <label htmlFor="sourceId" className="text-sm font-medium text-foreground">
          复核源
        </label>
        <select
          id="sourceId"
          name="sourceId"
          className="admin-form-select"
          value={selectedSourceId}
          onChange={(event) => setSelectedSourceId(event.target.value)}
          disabled={queue.length === 0}
        >
          {queue.length ? null : <option value="">当前没有待处理项</option>}
          {queue.map((item) => (
            <option key={item.id} value={item.id}>
              {item.vendor} · {item.status} · {item.item}
            </option>
          ))}
        </select>
        <FieldMessage message={state.fieldErrors?.sourceId} />
      </div>

      {selectedItem ? (
        <div className="rounded-[12px] border border-border bg-background/72 px-4 py-3">
          <div className="text-sm font-semibold text-foreground">{selectedItem.item}</div>
          <div className="mt-1 text-[12px] text-muted-foreground">
            {selectedItem.type} · {selectedItem.sourceUrl}
          </div>
          <p className="mt-2 text-[12px] leading-6 text-muted-foreground">
            {selectedItem.reason}
          </p>
        </div>
      ) : null}

      <div className="grid gap-2">
        <label htmlFor="reviewStatus" className="text-sm font-medium text-foreground">
          处理结论
        </label>
        <select
          key={`status-${selectedSourceId || "empty"}`}
          id="reviewStatus"
          name="reviewStatus"
          className="admin-form-select"
          defaultValue={defaultReviewStatus}
        >
          {reviewStatuses.map((status) => (
            <option key={status} value={status}>
              {renderSourceReviewStatusLabel(status)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label htmlFor="sourceReviewNote" className="text-sm font-medium text-foreground">
          处理备注
        </label>
        <Textarea
          key={selectedSourceId || "empty"}
          id="sourceReviewNote"
          name="note"
          className="min-h-28"
          defaultValue={buildDefaultNote(selectedItem)}
          placeholder="写清楚是否可发布、是否换采集方式、是否需要人工补录。"
          disabled={queue.length === 0}
        />
        <FieldMessage message={state.fieldErrors?.note} />
      </div>

      {state.message ? (
        <div
          className={
            state.status === "success"
              ? "rounded-[12px] border border-primary/20 bg-primary/8 px-3 py-2 text-sm text-foreground"
              : "rounded-[12px] border border-destructive/25 bg-destructive/8 px-3 py-2 text-sm text-destructive"
          }
        >
          <div>{state.message}</div>
          {state.detail ? <div className="mt-1 text-xs opacity-80">{state.detail}</div> : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending || queue.length === 0}>
          {pending ? "处理中..." : "写入复核结论"}
        </Button>
        <Button type="reset" variant="secondary" disabled={pending || queue.length === 0}>
          重置
        </Button>
      </div>
    </form>
  );
}
