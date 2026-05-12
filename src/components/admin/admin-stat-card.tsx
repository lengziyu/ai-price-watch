import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

export function AdminStatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="surface-card rounded-[14px] border-border">
      <CardContent className="flex items-start justify-between gap-3 px-5 py-5">
        <div>
          <div className="text-[12px] text-muted-foreground">{label}</div>
          <div className="mt-2 text-[2rem] font-semibold tracking-[-0.06em] text-foreground">
            {value}
          </div>
          <div className="mt-1 text-[12px] leading-5 text-muted-foreground">{detail}</div>
        </div>
        {icon ? <div className="mt-1">{icon}</div> : null}
      </CardContent>
    </Card>
  );
}
