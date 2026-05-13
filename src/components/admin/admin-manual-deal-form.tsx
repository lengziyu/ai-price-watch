"use client";

import { useActionState, useEffect, useRef } from "react";

import { createManualDealAction, type AdminMutationState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: AdminMutationState = {
  status: "idle",
};

function FieldMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs text-destructive">{message}</p>;
}

export function AdminManualDealForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(createManualDealAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            优惠标题
          </label>
          <Input id="title" name="title" placeholder="Claude 免费层适合文档总结与轻写作" />
          <FieldMessage message={state.fieldErrors?.title} />
        </div>

        <div className="grid gap-2">
          <label htmlFor="provider" className="text-sm font-medium text-foreground">
            厂商
          </label>
          <Input id="provider" name="provider" placeholder="Anthropic" />
          <FieldMessage message={state.fieldErrors?.provider} />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="summary" className="text-sm font-medium text-foreground">
          摘要
        </label>
        <Textarea
          id="summary"
          name="summary"
          className="min-h-24"
          placeholder="一句话概括优惠内容、限制条件和适合谁。"
        />
        <FieldMessage message={state.fieldErrors?.summary} />
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="grid gap-2">
          <label htmlFor="dealType" className="text-sm font-medium text-foreground">
            类型
          </label>
          <select id="dealType" name="dealType" className="admin-form-select">
            <option value="free_credit">免费额度</option>
            <option value="discount">折扣优惠</option>
            <option value="trial">试用活动</option>
            <option value="student">学生权益</option>
            <option value="region_price">地区价</option>
            <option value="other">其他</option>
          </select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="riskLevel" className="text-sm font-medium text-foreground">
            风险等级
          </label>
          <select id="riskLevel" name="riskLevel" className="admin-form-select">
            <option value="low">低风险</option>
            <option value="medium">中风险</option>
            <option value="high">高风险</option>
          </select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="status" className="text-sm font-medium text-foreground">
            当前状态
          </label>
          <select id="status" name="status" className="admin-form-select">
            <option value="active">进行中</option>
            <option value="unknown">待确认</option>
            <option value="expired">已结束</option>
          </select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="deadline" className="text-sm font-medium text-foreground">
            截止日期
          </label>
          <Input id="deadline" name="deadline" type="date" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="value" className="text-sm font-medium text-foreground">
            优惠值
          </label>
          <Input id="value" name="value" placeholder="$0 / month 或 赠送 100 credits" />
        </div>

        <div className="grid gap-2">
          <label htmlFor="sourceUrl" className="text-sm font-medium text-foreground">
            来源链接
          </label>
          <Input id="sourceUrl" name="sourceUrl" placeholder="https://..." />
          <FieldMessage message={state.fieldErrors?.sourceUrl} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="howToGet" className="text-sm font-medium text-foreground">
            领取方式
          </label>
          <Textarea
            id="howToGet"
            name="howToGet"
            className="min-h-24"
            placeholder="例如：注册账号后直接进入 Free Tier，或在教育邮箱验证后领取。"
          />
          <FieldMessage message={state.fieldErrors?.howToGet} />
        </div>

        <div className="grid gap-2">
          <label htmlFor="suitableFor" className="text-sm font-medium text-foreground">
            适合人群
          </label>
          <Textarea
            id="suitableFor"
            name="suitableFor"
            className="min-h-24"
            placeholder="普通用户、学生、原型验证、低预算 API 验证"
          />
          <FieldMessage message={state.fieldErrors?.suitableFor} />
        </div>
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
        <Button type="submit" disabled={pending}>
          {pending ? "提交中..." : "写入 AI 优惠"}
        </Button>
        <Button type="reset" variant="secondary" disabled={pending}>
          清空表单
        </Button>
      </div>
    </form>
  );
}
