import { LockKeyholeIcon, ShieldCheckIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { BrandLogo } from "@/components/layout/brand-logo";
import { HeroMesh } from "@/components/shared/hero-mesh";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrambleText } from "@/components/shared/scramble-text";
import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <div className="admin-shell relative flex min-h-screen items-center overflow-hidden bg-background px-4 py-6 text-foreground sm:py-8">
      <div className="hero-mesh-shell hero-grid-fade pointer-events-none absolute inset-x-0 top-0 h-[38vh] min-h-[18rem] opacity-70 lg:h-[46vh]">
        <HeroMesh className="opacity-90" />
      </div>
      <div className="admin-login-grid">
        <div className="space-y-3.5">
          <BrandLogo />
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/72 px-3 py-1.5 text-[11px] text-muted-foreground">
            <span className="size-2 rounded-full bg-primary" />
            <span>登录保护</span>
            <span>·</span>
            <span>操作日志</span>
            <span>·</span>
            <span>手动录入</span>
          </div>
          <div>
            <div className="mono-kicker text-[12px] uppercase text-muted-foreground">
              admin access
            </div>
            <h1 className="mt-2 max-w-[28rem] text-[1.72rem] font-semibold leading-[1.02] tracking-[-0.05em] sm:text-[2.25rem]">
              <span className="block">
                <ScrambleText text="登录后" />
              </span>
              <span className="block gradient-title">
                <ScrambleText text="再进入采集、复核与录入工作流" />
              </span>
            </h1>
          </div>
          <p className="max-w-[30rem] text-[12px] leading-6 text-muted-foreground sm:text-[13px]">
            这里用于维护价格、活动、文章和复核记录，方便持续更新站内内容。
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              <ShieldCheckIcon className="size-3.5" />
              HttpOnly Cookie
            </Badge>
            <Badge variant="outline">
              <LockKeyholeIcon className="size-3.5" />
              Server Action 鉴权
            </Badge>
          </div>
        </div>

        <Card className="surface-card rounded-[16px] border-border shadow-[0_24px_80px_rgba(2,44,34,0.12)]">
          <CardContent className="px-6 py-6 sm:px-7 sm:py-7">
            <div className="mb-5">
              <div className="text-lg font-semibold">管理员登录</div>
              <div className="mt-1 text-sm leading-6 text-muted-foreground">
                请输入管理员账号后继续。
              </div>
            </div>

            <AdminLoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
