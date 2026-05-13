"use client";

import { useActionState, useMemo, useState } from "react";

import { createMembershipRateReviewAction, type AdminMutationState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { membershipVendorBoards } from "@/data/membership-rates";

const initialState: AdminMutationState = {
  status: "idle",
};

const captureMethodLabel = {
  public_html: "公开页抓取",
  browser_assisted: "浏览器辅助",
  manual_review: "人工复核",
} as const;

function FieldMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs text-destructive">{message}</p>;
}

function buildReviewNote(vendor: (typeof membershipVendorBoards)[number]) {
  const starterPlans = vendor.plans
    .slice(0, 2)
    .map((item) => item.name)
    .join(" / ");

  return `${vendor.maintenanceTip}${starterPlans ? ` 优先从 ${starterPlans} 开始复核。` : ""}`;
}

export function AdminMembershipRateReviewForm() {
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [state, formAction, pending] = useActionState(
    createMembershipRateReviewAction,
    initialState,
  );

  const selectedVendor = useMemo(
    () => membershipVendorBoards.find((vendor) => vendor.id === selectedVendorId),
    [selectedVendorId],
  );

  return (
    <form
      action={formAction}
      className="grid gap-4"
      onReset={() => {
        setSelectedVendorId("");
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="vendorId" className="text-sm font-medium text-foreground">
            会员厂商
          </label>
          <select
            id="vendorId"
            name="vendorId"
            className="admin-form-select"
            value={selectedVendorId}
            onChange={(event) => setSelectedVendorId(event.target.value)}
          >
            <option value="" disabled>
              选择厂商
            </option>
            {membershipVendorBoards.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.label}
              </option>
            ))}
          </select>
          <FieldMessage message={state.fieldErrors?.vendorId} />
        </div>

        <div className="grid gap-2">
          <label htmlFor="planName" className="text-sm font-medium text-foreground">
            套餐名称
          </label>
          <Input
            id="planName"
            name="planName"
            placeholder={selectedVendor?.plans[0]?.name ?? "Premium+ / Pro / Enterprise Pro"}
          />
          <FieldMessage message={state.fieldErrors?.planName} />
        </div>
      </div>

      {selectedVendor ? (
        <div className="rounded-[12px] border border-border bg-background/72 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-foreground">{selectedVendor.title}</div>
            <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {selectedVendor.priceLabel}
            </span>
            <span className="rounded-full border border-primary/18 bg-primary/6 px-2.5 py-1 text-[11px] font-medium text-primary">
              {captureMethodLabel[selectedVendor.collectionMode]}
            </span>
          </div>
          <p className="mt-2 text-[12px] leading-6 text-muted-foreground">
            {selectedVendor.maintenanceTip}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedVendor.plans.slice(0, 3).map((plan) => (
              <span
                key={plan.name}
                className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground"
              >
                {plan.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="priceSummary" className="text-sm font-medium text-foreground">
            价格摘要
          </label>
          <Input
            id="priceSummary"
            name="priceSummary"
            placeholder={selectedVendor?.plans[0]?.price ?? "$40 / month 或 $40 / seat / month"}
          />
          <FieldMessage message={state.fieldErrors?.priceSummary} />
        </div>

        <div className="grid gap-2">
          <label htmlFor="regionScope" className="text-sm font-medium text-foreground">
            适用地区
          </label>
          <Input id="regionScope" name="regionScope" placeholder="Global / US / CN / 多地区价格" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="sourceUrl" className="text-sm font-medium text-foreground">
            官方来源链接
          </label>
          <Input
            key={`source-${selectedVendorId || "empty"}`}
            id="sourceUrl"
            name="sourceUrl"
            defaultValue={selectedVendor?.officialSource ?? ""}
            placeholder="https://..."
          />
          <FieldMessage message={state.fieldErrors?.sourceUrl} />
        </div>

        <div className="grid gap-2">
          <label htmlFor="evidenceUrl" className="text-sm font-medium text-foreground">
            证据链接
          </label>
          <Input
            id="evidenceUrl"
            name="evidenceUrl"
            placeholder="可填截图、帮助页或复核记录链接"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="captureMethod" className="text-sm font-medium text-foreground">
            采集方式
          </label>
          <select
            key={`capture-${selectedVendorId || "empty"}`}
            id="captureMethod"
            name="captureMethod"
            className="admin-form-select"
            defaultValue={selectedVendor?.collectionMode ?? "manual_review"}
          >
            <option value="manual_review">人工复核</option>
            <option value="browser_assisted">浏览器辅助</option>
            <option value="public_html">公开页抓取</option>
          </select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="reviewStatus" className="text-sm font-medium text-foreground">
            当前状态
          </label>
          <select
            id="reviewStatus"
            name="reviewStatus"
            className="admin-form-select"
            defaultValue="verified"
          >
            <option value="verified">已确认</option>
            <option value="needs_update">待更新</option>
            <option value="blocked">受限</option>
          </select>
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="note" className="text-sm font-medium text-foreground">
          复核备注
        </label>
        <Textarea
          key={`note-${selectedVendorId || "empty"}`}
          id="note"
          name="note"
          className="min-h-24"
          defaultValue={selectedVendor ? buildReviewNote(selectedVendor) : ""}
          placeholder="说明价格口径、限制条件，或为什么这里需要人工维护。"
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

      <div className="rounded-[12px] border border-border bg-background/72 px-3 py-3 text-[12px] leading-6 text-muted-foreground">
        选中厂商后，会自动带出官方来源、推荐采集方式和维护提示，方便连续补录同一个会员体系下的多个套餐。
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "提交中..." : "写入会员速率复核"}
        </Button>
        <Button type="reset" variant="secondary" disabled={pending}>
          清空表单
        </Button>
      </div>
    </form>
  );
}
