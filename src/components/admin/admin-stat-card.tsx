import type { ReactNode } from "react";

import { AdminAnimatedNumber } from "@/components/admin/admin-animated-number";
import { Card, CardContent } from "@/components/ui/card";

export function AdminStatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon?: ReactNode;
}) {
  const numericValue =
    typeof value === "number"
      ? value
      : /^[0-9]+$/.test(value)
        ? Number(value)
        : null;

  return (
    <Card className="surface-card motion-surface motion-surface--green rounded-[10px] border-border">
      <CardContent className="flex min-h-[8.25rem] items-start justify-between gap-3 px-4 py-4">
        <div>
          <div className="text-[12px] text-muted-foreground">{label}</div>
          <div className="mt-2 text-[2.05rem] font-semibold leading-none tracking-[-0.06em] text-foreground">
            {numericValue === null ? value : <AdminAnimatedNumber value={numericValue} />}
          </div>
          <div className="mt-1 text-[12px] leading-5 text-muted-foreground">{detail}</div>
        </div>
        {icon ? (
          <div className="mt-1 flex size-9 items-center justify-center rounded-[12px] border border-primary/12 bg-background/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]">
            {icon}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
