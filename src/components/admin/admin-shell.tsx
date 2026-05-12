import Link from "next/link";
import {
  ActivityIcon,
  BotIcon,
  MenuIcon,
} from "lucide-react";

import type { AdminSession } from "@/lib/admin-auth";
import { AdminLogoutForm } from "@/components/admin/admin-logout-form";
import { AdminSidebarNav, type AdminNavItem } from "@/components/admin/admin-sidebar-nav";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const adminNav: AdminNavItem[] = [
  { label: "总览", icon: "radar", href: "/admin" },
  { label: "采集任务", icon: "refresh", href: "/admin/jobs" },
  { label: "人工复核", icon: "shield", href: "/admin/review" },
  { label: "手动录入", icon: "pen", href: "/admin/manual" },
  { label: "内容数据", icon: "database", href: "/admin/content" },
  { label: "操作日志", icon: "logs", href: "/admin/logs" },
];

export function AdminShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: AdminSession;
}) {
  return (
    <div className="admin-shell min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="admin-sidebar hidden w-[286px] shrink-0 border-r border-border/70 xl:block">
          <div className="sticky top-0 flex h-screen flex-col px-4 py-4">
            <Link href="/admin" className="rounded-[14px] px-2 py-2">
              <BrandLogo />
            </Link>

            <div className="mt-6">
              <AdminSidebarNav items={adminNav} />
            </div>

            <div className="mt-auto space-y-4 pt-6">
              <div className="admin-side-card">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">更新策略</div>
                    <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                      每 6 小时跑公开价格页；异常结果转人工复核；高时效优惠允许手动补录。
                    </div>
                  </div>
                  <BotIcon className="size-4 text-primary" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">Cron</Badge>
                  <Badge variant="outline">Server Action</Badge>
                  <Badge variant="outline">JSON Store</Badge>
                </div>
              </div>

              <div className="admin-side-card">
                <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  operator
                </div>
                <div className="mt-2 text-sm font-medium">{session.username}</div>
                <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                  当前是最小可用后台，后续可平滑切到数据库和更细权限。
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="admin-topbar sticky top-0 z-40 border-b border-border/70">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-6">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger className="admin-mobile-trigger xl:hidden">
                    <MenuIcon className="size-4" />
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[88vw] max-w-sm border-r border-border/70">
                    <SheetHeader>
                      <SheetTitle>雷价通后台</SheetTitle>
                    </SheetHeader>
                    <div className="mt-5 flex flex-col gap-3 px-4">
                      <AdminSidebarNav items={adminNav} />
                      <div className="admin-side-card">
                        <div className="text-sm font-semibold">更新策略</div>
                        <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                          定时抓公开页，异常转人工，优惠允许手动录入。
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <div>
                  <div className="text-[13px] font-semibold">内容管理后台</div>
                  <div className="text-[12px] text-muted-foreground">
                    登录保护、操作日志和本地数据层已接入
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  <ActivityIcon className="size-3.5" />
                  本地模式
                </Badge>
                <Link
                  href="/"
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  返回前台
                </Link>
                <AdminLogoutForm />
                <div className="rounded-full border border-border bg-background/68 p-1">
                  <ThemeToggle compact />
                </div>
              </div>
            </div>
          </header>

          <div className="min-w-0 flex-1 px-4 py-4 sm:px-5 lg:px-6">
            <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
