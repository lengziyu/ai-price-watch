"use client";

import { useActionState } from "react";
import { RefreshCcwIcon } from "lucide-react";

import { triggerCrawlAction, type AdminMutationState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

const initialState: AdminMutationState = {
  status: "idle",
};

export function AdminTriggerCrawlForm() {
  const [state, formAction, pending] = useActionState(triggerCrawlAction, initialState);

  return (
    <form action={formAction} className="grid gap-3">
      <Button type="submit" size="sm" disabled={pending}>
        <RefreshCcwIcon data-icon="inline-start" className={pending ? "animate-spin" : ""} />
        {pending ? "抓取中..." : "立即运行一次抓取"}
      </Button>

      {state.message ? (
        <div
          className={
            state.status === "success"
              ? "rounded-[12px] border border-primary/20 bg-primary/8 px-3 py-2 text-sm text-foreground"
              : "rounded-[12px] border border-destructive/25 bg-destructive/8 px-3 py-2 text-sm text-destructive"
          }
        >
          <div>{state.message}</div>
          {state.detail ? (
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-5 opacity-80">
              {state.detail}
            </pre>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
